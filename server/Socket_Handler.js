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
                    const lobby = lobby_manager.create_lobby({
                        lobby_id,
                        host_player: player,
                        max_players: max,
                    });

                    console.log(
                        `🏠 lobby created: ${lobby_id} by ${firebaseUid}`
                    );

                    socket.join(lobby_id);

                    socket.emit("lobby_created", {
                        lobby_id,
                        firebaseUid: firebaseUid,
                    });
                } catch (err) {
                    console.log(`⚠️ lobby creation failed: ${err.message}`);
                    socket.emit("error", err.message);
                }
            });
        });

        socket.on("disconnect", () => {
            const uid = socket.firebaseUid;
            if (uid && player_manager.get_player(uid)) {
                console.log(`🔌 disconnected: ${uid}`);
                // Don't remove player here — could be host or in a game
                player_manager.update_socket_id(uid, null);
            } else {
                console.log(`⚠️ unknown disconnect: ${socket.id}`);
            }
        });
    });
}
