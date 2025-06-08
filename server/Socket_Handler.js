import Lobby from "./models/Lobby.js";
import Player from "./models/Player.js";
import Lobby_Manager from "./managers/Lobby_Manager.js";
import Player_Manager from "./managers/Player_Manager.js";

export function socket_handler(io) {
    const user_sockets = new Map(); // track sockets by firebase uid
    const lobby_manager = new Lobby_Manager();
    const player_manager = new Player_Manager();

    function cleanup_lobby(lobby_id) {
        const lobby = lobby_manager.get_lobby(lobby_id);
        if (lobby && lobby.is_empty()) {
            lobby_manager.delete_lobby(lobby_id);
            console.log(`🗑️ cleaned up empty lobby ${lobby_id}`);
        }
    }

    io.on("connection", (socket) => {
        const user_agent = socket.handshake.headers["user-agent"] || "";
        if (user_agent.includes("node-XMLHttpRequest")) {
            console.log(`🚫 blocking non-browser connection: ${socket.id}`);
            socket.disconnect(true);
            return;
        }

        console.log(
            `✅ new client connected: ${socket.id}`,
            socket.handshake.headers
        );

        const auth_timeout = setTimeout(() => {
            if (!socket.firebaseUid) {
                console.log(`🕒 no auth received, disconnecting: ${socket.id}`);
                socket.disconnect(true);
            }
        }, 5000);

        socket.on("auth", ({ firebaseUid, username }) => {
            clearTimeout(auth_timeout);

            // disconnect existing socket for this uid, if any
            const existing_socket = user_sockets.get(firebaseUid);
            if (existing_socket) {
                console.log(
                    `🔄 replacing socket for user: ${firebaseUid}, old: ${existing_socket.id}, new: ${socket.id}`
                );
                existing_socket.disconnect(true);
            }

            socket.firebaseUid = firebaseUid;
            socket.username = username;
            user_sockets.set(firebaseUid, socket);
            console.log(
                `🔐 user authenticated: ${firebaseUid} (${username}) with socket ${socket.id}`
            );

            socket.on(
                "create_lobby",
                ({ lobby_id, username, max_players = 4 }) => {
                    // check for duplicate lobby
                    if (lobby_manager.lobby_exists(lobby_id)) {
                        socket.emit("error", "Lobby already exists");
                        return;
                    }

                    // create host player
                    const new_player = player_manager.add_player({
                        id: socket.firebaseUid,
                        name: username,
                        socket_id: socket.id,
                        is_host: true,
                    });

                    // create lobby
                    const new_lobby = lobby_manager.create_lobby({
                        host: new_player,
                        max_players,
                        name: `lobby-${lobby_id}`,
                    });

                    // join socket room
                    socket.join(lobby_id);
                    console.log(
                        `🚪 ${username} (${socket.firebaseUid}) created lobby ${lobby_id}`
                    );

                    // confirm creation to creator
                    socket.emit("lobby_created", {
                        lobby_id,
                        firebaseUid: socket.firebaseUid,
                    });

                    // notify all clients in room of updated player list
                    io.to(lobby_id).emit(
                        "update_players",
                        new_lobby.get_player_list()
                    );
                }
            );

            socket.on("join_lobby", ({ lobby_id, username }) => {
                const lobby = lobby_manager.get_lobby(lobby_id);
                if (!lobby) {
                    socket.emit("error", "Lobby does not exist");
                    return;
                }

                if (lobby.get_player_list().length >= lobby.max_players) {
                    socket.emit("error", "Lobby is full");
                    return;
                }

                const player = player_manager.add_player({
                    id: socket.firebaseUid,
                    name: username,
                    socket_id: socket.id,
                    is_host: false,
                });

                lobby_manager.add_player_to_lobby(lobby_id, player);
                socket.join(lobby_id);
                console.log(
                    `➕ ${username} (${socket.firebaseUid}) joined lobby ${lobby_id}`
                );

                socket.emit("joined_success", {
                    lobby_id,
                    firebaseUid: socket.firebaseUid,
                });
                io.to(lobby_id).emit("update_players", lobby.get_player_list());
            });
        });

        socket.on("disconnect", (reason) => {
            console.log(
                `❌ client disconnected: ${socket.id} (${
                    socket.firebaseUid || "unknown"
                })`,
                `reason: ${reason}`
            );
            if (socket.firebaseUid) {
                user_sockets.delete(socket.firebaseUid);
                player_manager.remove_player(socket.firebaseUid);
                lobby_manager.remove_player_from_lobbies({
                    id: socket.firebaseUid,
                });
                // cleanup empty lobbies
                for (const lobby of lobby_manager.get_all_lobbies()) {
                    cleanup_lobby(lobby.id);
                }
            }
        });
    });
}
