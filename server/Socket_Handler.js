
// server/socket_handler.js

import Player_Manager from "./managers/Player_Manager.js";
import Lobby_Manager from "./managers/Lobby_Manager.js";

export function socket_handler(io) {
    const player_manager = new Player_Manager();
    const lobby_manager = new Lobby_Manager();

    io.on("connection", (socket) => {
        const user_agent = socket.handshake.headers["user-agent"] || "";
        if (user_agent.includes("node-XMLHttpRequest")) {
            console.log(`🚫 blocked bot: ${socket.id}`);
            socket.disconnect(true);
            return;
        }

        console.log(`🔌 connected: ${socket.id}`);

        const auth_timeout = setTimeout(() => {
            if (!socket.firebaseUid) {
                console.log(`⏳ auth timeout: ${socket.id}`);
                socket.disconnect(true);
            }
        }, 5000);

        socket.on("auth", ({ firebaseUid, username }) => {
            clearTimeout(auth_timeout);

            if (!firebaseUid || !username || typeof firebaseUid !== "string" || typeof username !== "string") {
                console.log(`🚫 invalid auth from ${socket.id}`);
                socket.disconnect(true);
                return;
            }

            socket.firebaseUid = firebaseUid;

            const existing = player_manager.get_player(firebaseUid);
            if (existing) {
                player_manager.update_socket_id(firebaseUid, socket.id);
                console.log(`🔁 reconnected: ${firebaseUid}`);
            } else {
                player_manager.add_player({ id: firebaseUid, name: username, socket_id: socket.id });
                console.log(`✅ new player: ${firebaseUid}`);
            }

            socket.on("create_lobby", ({ lobby_id, max_players }) => {
                const player = player_manager.get_player(firebaseUid);
                if (!lobby_id || lobby_manager.lobby_exists(lobby_id)) {
                    socket.emit("error", "Invalid or duplicate lobby ID");
                    return;
                }

                try {
                    lobby_manager.create_lobby({
                        lobby_id,
                        host_player: player,
                        max_players: Number(max_players) || 4,
                    });

                    socket.join(lobby_id);
                    socket.lobby_id = lobby_id;

                    socket.emit("lobby_created", { lobby_id, firebaseUid });
                } catch (err) {
                    socket.emit("error", err.message);
                }
            });

            socket.on("join_lobby", ({ lobby_id }) => {
                const player = player_manager.get_player(firebaseUid);
                const lobby = lobby_manager.get_lobby(lobby_id);

                if (!lobby || lobby.has_player(firebaseUid)) {
                    socket.emit("error", "Lobby not found or already joined");
                    return;
                }

                try {
                    lobby_manager.add_player_to_lobby(lobby_id, player);
                    socket.join(lobby_id);
                    socket.lobby_id = lobby_id;

                    socket.emit("joined_lobby", {
                        lobby_id,
                        players: lobby.get_player_list(),
                        host_id: lobby.host_id,
                    });

                    io.to(lobby_id).emit("update_lobby", {
                        players: lobby.get_player_list(),
                        host_id: lobby.host_id,
                    });
                } catch (err) {
                    socket.emit("error", err.message);
                }
            });

            socket.on("leave_lobby", ({ lobby_id }) => {
                const player = player_manager.get_player(firebaseUid);
                const lobby = lobby_manager.get_lobby(lobby_id);

                if (!lobby || !lobby.has_player(firebaseUid)) {
                    socket.emit("error", "You are not in this lobby");
                    return;
                }

                lobby_manager.remove_player_from_lobby(lobby_id, player);
                socket.leave(lobby_id);
                delete socket.lobby_id;

                if (lobby.is_empty()) lobby_manager.delete_lobby(lobby_id);

                io.to(lobby_id).emit("update_lobby", {
                    host_id: lobby.host_id,
                    players: lobby.get_player_list(),
                });

                socket.emit("left_lobby", { lobby_id });
            });

            // BlockTanks.io Game Events
            socket.on("tank_update", ({ lobby_id, tankData }) => {
                const lobby = lobby_manager.get_lobby(lobby_id);
                if (!lobby) return;
                io.to(lobby_id).emit("tank_update", { firebaseUid, tankData });
            });

            socket.on("fire_bullet", ({ lobby_id, bulletData }) => {
                const lobby = lobby_manager.get_lobby(lobby_id);
                if (!lobby) return;
                io.to(lobby_id).emit("bullet_fired", { firebaseUid, bulletData });
            });

            socket.on("start_game", ({ lobby_id }) => {
                const lobby = lobby_manager.get_lobby(lobby_id);
                if (!lobby || lobby.host_id !== firebaseUid) {
                    socket.emit("error", "Only host can start the game");
                    return;
                }
                io.to(lobby_id).emit("game_started");
            });
        });

        socket.on("disconnect", () => {
            const firebaseUid = socket.firebaseUid;
            const player = player_manager.get_player(firebaseUid);
            const lobby_id = socket.lobby_id;

            if (lobby_id) {
                const lobby = lobby_manager.get_lobby(lobby_id);
                if (lobby) {
                    lobby_manager.remove_player_from_lobby(lobby_id, player);
                    if (lobby.is_empty()) lobby_manager.delete_lobby(lobby_id);
                    else io.to(lobby_id).emit("update_lobby", {
                        host_id: lobby.host_id,
                        players: lobby.get_player_list(),
                    });
                }
            }

            if (firebaseUid) player_manager.remove_player(firebaseUid);
            console.log(`❌ Disconnected: ${firebaseUid}`);
        });
    });
}
