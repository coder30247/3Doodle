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

            if (
                !firebaseUid ||
                !username ||
                typeof firebaseUid !== "string" ||
                typeof username !== "string"
            ) {
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
                player_manager.add_player({
                    id: firebaseUid,
                    name: username,
                    socket_id: socket.id,
                });
                console.log(`✅ new player: ${firebaseUid}`);
            }

            socket.on("create_lobby", ({ lobby_id, max_players }) => {
                const firebaseUid = socket.firebaseUid;

                if (!firebaseUid) {
                    console.log(`❌ create_lobby without auth: ${socket.id}`);
                    socket.emit("error", "Unauthorized");
                    return;
                }

                const player = player_manager.get_player(firebaseUid);

                if (!player) {
                    console.log(
                        `❌ create_lobby failed — no player: ${firebaseUid}`
                    );
                    socket.emit("error", "Player not found");
                    return;
                }

                if (!lobby_id || typeof lobby_id !== "string") {
                    socket.emit("error", "Invalid lobby ID");
                    return;
                }

                if (lobby_manager.lobby_exists(lobby_id)) {
                    socket.emit("error", "Lobby ID already taken");
                    return;
                }

                try {
                    const max = Number(max_players) || 4;
                    lobby_manager.create_lobby({
                        lobby_id,
                        host_player: player,
                        max_players: max,
                    });

                    console.log(
                        `🏠 lobby created: ${lobby_id} by ${firebaseUid}`
                    );

                    socket.join(lobby_id);
                    socket.lobby_id = lobby_id; // Store lobby ID in socket

                    socket.emit("lobby_created", {
                        lobby_id,
                        firebaseUid: firebaseUid,
                    });
                } catch (err) {
                    console.log(`⚠️ lobby creation failed: ${err.message}`);
                    socket.emit("error", err.message);
                }
            });
            socket.on("join_lobby", ({ lobby_id }) => {
                const firebaseUid = socket.firebaseUid;

                if (!firebaseUid) {
                    console.log(`❌ join_lobby without auth: ${socket.id}`);
                    socket.emit("error", "Unauthorized");
                    return;
                }

                if (!lobby_id || typeof lobby_id !== "string") {
                    socket.emit("error", "Invalid lobby ID");
                    return;
                }

                const player = player_manager.get_player(firebaseUid);
                if (!player) {
                    console.log(
                        `❌ join_lobby failed — player not found: ${firebaseUid}`
                    );
                    socket.emit("error", "Player not found");
                    return;
                }

                const lobby = lobby_manager.get_lobby(lobby_id);
                if (!lobby) {
                    socket.emit("error", "Lobby not found");
                    return;
                }

                if (lobby.has_player(firebaseUid)) {
                    socket.emit("error", "Already in lobby");
                    return;
                }

                try {
                    lobby_manager.add_player_to_lobby(lobby_id, player);
                    socket.join(lobby_id);
                    socket.lobby_id = lobby_id; // Store lobby ID in socket

                    console.log(`➕ ${firebaseUid} joined lobby ${lobby_id}`);
                    const host_id = lobby.host_id;
                    socket.emit("joined_lobby", {
                        lobby_id: lobby_id,
                        players: lobby.get_player_list(),
                        host_id: host_id,
                    });

                    io.to(lobby_id).emit("update_lobby", {
                        players: lobby.get_player_list(),
                        host_id: host_id,
                    });
                } catch (err) {
                    console.log(`⚠️ join_lobby failed: ${err.message}`);
                    socket.emit("error", err.message);
                }
            });

            socket.on("leave_lobby", ({ lobby_id }) => {
                const firebaseUid = socket.firebaseUid;

                if (!firebaseUid) {
                    console.log(`❌ leave_lobby without auth: ${socket.id}`);
                    socket.emit("error", "Unauthorized");
                    return;
                }

                if (!lobby_id || typeof lobby_id !== "string") {
                    socket.emit("error", "Invalid lobby ID");
                    return;
                }

                const player = player_manager.get_player(firebaseUid);
                if (!player) {
                    socket.emit("error", "Player not found");
                    return;
                }

                const lobby = lobby_manager.get_lobby(lobby_id);
                if (!lobby) {
                    socket.emit("error", "Lobby not found");
                    return;
                }

                if (!lobby.has_player(firebaseUid)) {
                    socket.emit("error", "You are not in this lobby");
                    return;
                }

                try {
                    lobby_manager.remove_player_from_lobby(lobby_id, player);
                    socket.leave(lobby_id);
                    delete socket.lobby_id; // Clear lobby ID from socket
                    console.log(`👋 ${firebaseUid} left lobby ${lobby_id}`);

                    if (lobby.is_empty()) {
                        console.log(`🗑️ deleting empty lobby: ${lobby_id}`);
                        lobby_manager.delete_lobby(lobby_id);
                    }

                    // Notify the leaver
                    socket.emit("left_lobby", { lobby_id });

                    // Notify remaining members
                    io.to(lobby_id).emit("update_lobby", {
                        host_id: lobby.host_id,
                        players: lobby.get_player_list(),
                    });
                } catch (err) {
                    console.log(`⚠️ leave_lobby failed: ${err.message}`);
                    socket.emit("error", err.message);
                }
            });

            // 💬 GLOBAL CHAT — Send & Broadcast Messages
            socket.on("global_chat:send", ({ username, message }) => {
                const uid = socket.firebaseUid;

                if (!uid || typeof message !== "string" || !message.trim()) {
                    socket.emit("error", "Invalid global chat message");
                    return;
                }

                const player = player_manager.get_player(uid);
                if (!player) {
                    socket.emit("error", "Player not found");
                    return;
                }

                player.update_name(username);

                const trimmed_msg = message.trim();

                // 🌐 Broadcast to all connected clients
                io.emit("global_chat:broadcast", {
                    message: trimmed_msg,
                    sender: player.name,
                    timestamp: Date.now(),
                });

                // 🔄 Update online player list
                const players_list = player_manager
                    .get_all_players()
                    .map((player) => ({
                        id: player.id,
                        name: player.name,
                    }));
                io.emit("global_chat:players", players_list);
            });

            // 🧑‍🤝‍🧑 GLOBAL CHAT — Initial player list on connect
            const players_list = player_manager
                .get_all_players()
                .map((player) => ({
                    id: player.id,
                    name: player.name,
                }));
            socket.emit("global_chat:players", players_list);

            // 💬 LOBBY CHAT — Scoped chat per lobby
            socket.on("lobby_chat:send", ({ lobby_id, message }) => {
                const uid = socket.firebaseUid;

                if (
                    !uid ||
                    typeof lobby_id !== "string" ||
                    typeof message !== "string" ||
                    !message.trim()
                ) {
                    socket.emit("error", "Invalid lobby chat input");
                    return;
                }

                const player = player_manager.get_player(uid);
                const lobby = lobby_manager.get_lobby(lobby_id);

                if (!player || !lobby || !lobby.has_player(uid)) {
                    socket.emit("error", "Not in this lobby");
                    return;
                }

                const trimmed_msg = message.trim();

                // 📢 Send message only to clients in this lobby
                io.to(lobby_id).emit("lobby_chat:broadcast", {
                    message: trimmed_msg,
                    sender: player.name,
                    timestamp: Date.now(),
                });
            });
        });

        socket.on("disconnect", () => {
            const firebaseUid = socket.firebaseUid;

            if (!firebaseUid) {
                console.log(`⚠️ Unknown disconnect: ${socket.id}`);
                return;
            }

            const player = player_manager.get_player(firebaseUid);
            if (!player) {
                console.log(`⚠️ Disconnect — player not found: ${firebaseUid}`);
                return;
            }

            const lobby_id = socket.lobby_id;

            if (lobby_id) {
                const lobby = lobby_manager.get_lobby(lobby_id);

                if (lobby && lobby.has_player(firebaseUid)) {
                    lobby_manager.remove_player_from_lobby(lobby_id, player);
                    console.log(
                        `👋 ${firebaseUid} removed from lobby ${lobby_id} (disconnect)`
                    );

                    if (lobby.is_empty()) {
                        lobby_manager.delete_lobby(lobby_id);
                        console.log(`🗑️ Deleted empty lobby: ${lobby_id}`);
                    } else {
                        io.to(lobby_id).emit("update_lobby", {
                            host_id: lobby.host_id,
                            players: lobby.get_player_list(),
                        });
                    }
                }
            }

            player_manager.remove_player(firebaseUid);
            console.log(
                `🔌 Disconnected: ${firebaseUid} from players list (cleaned up)`
            );
        });
    });
}
