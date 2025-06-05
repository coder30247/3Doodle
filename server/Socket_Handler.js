const {
    Player,
    activeLobbies,
    generateLobbyId,
    cleanupLobby,
} = require("./models/Lobby_Manager");

function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("✅ New client connected:", socket.id);

        // 🆕 Create lobby
        socket.on("create-lobby", ({ lobbyId, username, maxPlayers = 4 }) => {
            if (!lobbyId || !username) return;

            // Avoid duplicate lobby
            if (activeLobbies.has(lobbyId)) {
                socket.emit("error", "Lobby already exists");
                return;
            }

            // Create the lobby
            const userId = generateLobbyId();
            const newPlayer = new Player(userId, username, socket.id);
            newPlayer.isHost = true;

            activeLobbies.set(lobbyId, {
                id: lobbyId,
                players: [newPlayer],
                maxPlayers,
            });

            socket.join(lobbyId);
            console.log(`🚪 Created lobby ${lobbyId} by ${username}`);

            // Send back confirmation
            socket.emit("lobby-created", { lobbyId, userId });

            // Notify players in lobby (should be only one at this point)
            io.to(lobbyId).emit(
                "update-players",
                activeLobbies.get(lobbyId).players
            );
        });

        // ➕ Join lobby
        socket.on("join-lobby", ({ lobbyId, username }) => {
            if (!activeLobbies.has(lobbyId)) {
                socket.emit("error", "Lobby does not exist");
                return;
            }

            const lobby = activeLobbies.get(lobbyId);
            if (lobby.players.length >= lobby.maxPlayers) {
                socket.emit("error", "Lobby is full");
                return;
            }

            const userId = generateLobbyId();
            const player = new Player(userId, username, socket.id);
            player.isHost = false;

            lobby.players.push(player);

            socket.join(lobbyId);
            console.log(`➕ ${username} joined lobby ${lobbyId}`);

            socket.emit("joined-success", { lobbyId, userId });
            io.to(lobbyId).emit("update-players", lobby.players);
        });

        // ❌ Handle disconnect
        socket.on("disconnect", () => {
            for (const [lobbyId, lobby] of activeLobbies.entries()) {
                const index = lobby.players.findIndex(
                    (p) => p.socketId === socket.id
                );

                if (index !== -1) {
                    const leftPlayer = lobby.players.splice(index, 1)[0];
                    console.log(`❌ ${leftPlayer.name} left ${lobbyId}`);

                    io.to(lobbyId).emit("update-players", lobby.players);
                    cleanupLobby(lobbyId, activeLobbies);
                    break;
                }
            }
        });
    });
}

module.exports = socketHandler;
