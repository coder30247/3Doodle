const {
    Player,
    activeLobbies,
    generateLobbyId,
    cleanupLobby,
} = require("./models/Lobby_Manager");

function socketHandler(io) {
    io.on("connection", (socket) => {
        const userAgent = socket.handshake.headers["user-agent"] || "";
        if (userAgent.includes("node-XMLHttpRequest")) {
            console.log(`🚫 Blocking non-browser connection: ${socket.id}`);
            socket.disconnect(true);
            return;
        }

        console.log(
            "✅ New client connected:",
            socket.id,
            socket.handshake.headers
        );

        // Set a timeout to disconnect unauthenticated sockets
        const authTimeout = setTimeout(() => {
            if (!socket.firebaseUid) {
                console.log(`🕒 No auth received, disconnecting: ${socket.id}`);
                socket.disconnect(true);
            }
        }, 5000);

        // Handle user authentication with Firebase UID
        socket.on("auth", ({ firebaseUid, username }) => {
            clearTimeout(authTimeout); // Cancel timeout on auth
            console.log(
                `🔐 User authenticated: ${firebaseUid} (${username}) with socket ${socket.id}`
            );
            socket.firebaseUid = firebaseUid;
            socket.username = username;
        });

        // 🆕 Create lobby
        socket.on("create-lobby", ({ lobbyId, username, maxPlayers = 4 }) => {
            if (!lobbyId || !username || !socket.firebaseUid) {
                socket.emit(
                    "error",
                    "Missing lobbyId, username, or not authenticated"
                );
                return;
            }

            if (activeLobbies.has(lobbyId)) {
                socket.emit("error", "Lobby already exists");
                return;
            }

            const newPlayer = new Player(
                socket.firebaseUid,
                username,
                socket.id
            );
            newPlayer.isHost = true;

            const lobby = {
                id: lobbyId,
                players: new Map([[socket.firebaseUid, newPlayer]]),
                maxPlayers,
                createdAt: new Date(),
                gameState: "lobby",
            };

            activeLobbies.set(lobbyId, lobby);
            socket.join(lobbyId);
            console.log(
                `🚪 ${username} (${socket.firebaseUid}) created lobby ${lobbyId}`
            );

            socket.emit("lobby-created", {
                lobbyId,
                firebaseUid: socket.firebaseUid,
            });
            io.to(lobbyId).emit(
                "update-players",
                Array.from(lobby.players.values())
            );
        });

        // ➕ Join lobby
        socket.on("join-lobby", ({ lobbyId, username }) => {
            if (!lobbyId || !username || !socket.firebaseUid) {
                socket.emit(
                    "error",
                    "Missing lobbyId, username, or not authenticated"
                );
                return;
            }

            if (!activeLobbies.has(lobbyId)) {
                socket.emit("error", "Lobby does not exist");
                return;
            }

            const lobby = activeLobbies.get(lobbyId);
            if (lobby.players.size >= lobby.maxPlayers) {
                socket.emit("error", "Lobby is full");
                return;
            }

            const player = new Player(socket.firebaseUid, username, socket.id);
            player.isHost = false;

            lobby.players.set(socket.firebaseUid, player);
            socket.join(lobbyId);
            console.log(
                `➕ ${username} (${socket.firebaseUid}) joined lobby ${lobbyId}`
            );

            socket.emit("joined-success", {
                lobbyId,
                firebaseUid: socket.firebaseUid,
            });
            io.to(lobbyId).emit(
                "update-players",
                Array.from(lobby.players.values())
            );
        });

        // ❌ Handle disconnect
        socket.on("disconnect", (reason) => {
            console.log(
                `❌ Client disconnected: ${socket.id} (${
                    socket.firebaseUid || "unknown"
                })`,
                `reason: ${reason}`
            );
            for (const [lobbyId, lobby] of activeLobbies.entries()) {
                if (lobby.players.has(socket.firebaseUid)) {
                    const leftPlayer = lobby.players.get(socket.firebaseUid);
                    lobby.players.delete(socket.firebaseUid);
                    console.log(
                        `❌ ${leftPlayer.name} (${leftPlayer.id}) left ${lobbyId}`
                    );
                    io.to(lobbyId).emit(
                        "update-players",
                        Array.from(lobby.players.values())
                    );
                    cleanupLobby(lobbyId, activeLobbies);
                    break;
                }
            }
        });
    });
}

module.exports = socketHandler;
