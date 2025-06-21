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

        // Set authentication timeout
        const auth_timeout = setTimeout(() => {
            if (!socket.firebaseUid) {
                console.log(`⏳ auth timeout: ${socket.id}`);
                socket.emit("auth_required");
                socket.disconnect(true);
            }
        }, 5000);

        socket.on("auth", ({ firebaseUid, username }) => {
            clearTimeout(auth_timeout);
            console.log(`🔐 Auth attempt from ${socket.id}:`, { firebaseUid, username });

            if (!firebaseUid || !username || typeof firebaseUid !== "string" || typeof username !== "string") {
                console.log(`🚫 invalid auth from ${socket.id}`);
                socket.emit("error", "Invalid authentication data");
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

            // Send authentication success
            socket.emit("auth_success", { firebaseUid, username });

            // Set up authenticated socket handlers
            setupAuthenticatedHandlers(socket, firebaseUid, player_manager, lobby_manager, io);
        });
    });

    function setupAuthenticatedHandlers(socket, firebaseUid, player_manager, lobby_manager, io) {
        socket.on("create_lobby", ({ lobby_id, max_players }) => {
            console.log(`🏗️ Create lobby request from ${firebaseUid}:`, { lobby_id, max_players });
            
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

                const lobby = lobby_manager.get_lobby(lobby_id);
                lobby.tankStates = {}; // Initialize tank states

                socket.join(lobby_id);
                socket.lobby_id = lobby_id;

                socket.emit("lobby_created", { lobby_id, firebaseUid });
                console.log(`✅ Lobby created: ${lobby_id} by ${firebaseUid}`);
            } catch (err) {
                console.error(`❌ Error creating lobby:`, err);
                socket.emit("error", err.message);
            }
        });

        socket.on("join_lobby", ({ lobby_id, initialPosition }) => {
            console.log(`🚪 Join lobby request from ${firebaseUid}:`, { lobby_id, initialPosition });
            
            const player = player_manager.get_player(firebaseUid);
            let lobby = lobby_manager.get_lobby(lobby_id);

            // Auto-create lobby if it doesn't exist
            if (!lobby) {
                console.log(`🏗️ Auto-creating lobby: ${lobby_id}`);
                try {
                    lobby_manager.create_lobby({
                        lobby_id,
                        host_player: player,
                        max_players: 4,
                    });
                    lobby = lobby_manager.get_lobby(lobby_id);
                    lobby.tankStates = {};
                } catch (err) {
                    console.error(`❌ Error auto-creating lobby:`, err);
                    socket.emit("error", "Could not create/join lobby");
                    return;
                }
            }

            if (lobby.has_player(firebaseUid)) {
                console.log(`⚠️ Player already in lobby: ${firebaseUid}`);
                // Don't error, just continue - they're rejoining
            } else {
                try {
                    lobby_manager.add_player_to_lobby(lobby_id, player);
                } catch (err) {
                    console.error(`❌ Error adding player to lobby:`, err);
                    socket.emit("error", err.message);
                    return;
                }
            }

            socket.join(lobby_id);
            socket.lobby_id = lobby_id;

            // Initialize tank states if not exists
            if (!lobby.tankStates) {
                lobby.tankStates = {};
                console.log(`🔧 Initialized tank states for lobby: ${lobby_id}`);
            }

            // Set initial tank position
            if (initialPosition) {
                lobby.tankStates[firebaseUid] = initialPosition;
                console.log(`🚗 Set initial position for ${firebaseUid}:`, initialPosition);
            }

            // Send confirmation to joining player
            socket.emit("joined_lobby", {
                lobby_id,
                players: lobby.get_player_list(),
                host_id: lobby.host_id,
            });

            // Send current tank states to joining player first
            console.log(`📡 Sending current tank states to ${firebaseUid}:`, lobby.tankStates);
            socket.emit("update_tanks", lobby.tankStates);

            // Then broadcast to all players in lobby
            io.to(lobby_id).emit("update_lobby", {
                players: lobby.get_player_list(),
                host_id: lobby.host_id,
            });

            // Broadcast updated tank states to all players
            io.to(lobby_id).emit("update_tanks", lobby.tankStates);

            console.log(`✅ Player ${firebaseUid} joined lobby ${lobby_id}`);
            console.log(`📊 Current lobby state:`, {
                players: lobby.get_player_list().map(p => p.id),
                tankStates: Object.keys(lobby.tankStates)
            });
        });

        socket.on("tank_move", ({ x, y, rotation, room_id, firebaseUid: movingPlayerId }) => {
            const lobby = lobby_manager.get_lobby(room_id);
            if (!lobby) {
                console.log(`❌ Tank move - lobby not found: ${room_id}`);
                return;
            }

            // Validate the moving player
            if (movingPlayerId !== firebaseUid) {
                console.log(`🚫 Tank move - player mismatch: ${movingPlayerId} vs ${firebaseUid}`);
                return;
            }

            // Initialize tank states if needed
            if (!lobby.tankStates) {
                lobby.tankStates = {};
            }

            // Update tank state
            lobby.tankStates[firebaseUid] = { x, y, rotation };

            // Broadcast to OTHER players in the room (not the sender)
            socket.to(room_id).emit("update_tanks", lobby.tankStates);

            // Debug log (comment out in production)
            // console.log(`🚗 Tank move from ${firebaseUid}:`, { x, y, rotation });
        });

        socket.on("fire_bullet", ({ lobby_id, bulletData }) => {
            const lobby = lobby_manager.get_lobby(lobby_id);
            if (!lobby) {
                console.log(`❌ Bullet fire - lobby not found: ${lobby_id}`);
                return;
            }
            
            console.log(`💥 Bullet fired by ${firebaseUid} in lobby ${lobby_id}`);
            // Broadcast to all players in the lobby
            io.to(lobby_id).emit("bullet_fired", { firebaseUid, bulletData });
        });

        socket.on("start_game", ({ lobby_id }) => {
            const lobby = lobby_manager.get_lobby(lobby_id);
            if (!lobby || lobby.host_id !== firebaseUid) {
                socket.emit("error", "Only host can start the game");
                return;
            }
            
            console.log(`🎮 Game started in lobby ${lobby_id} by host ${firebaseUid}`);
            io.to(lobby_id).emit("game_started");
        });

        socket.on("leave_lobby", ({ lobby_id }) => {
            handleLeaveLobby(socket, firebaseUid, lobby_id, player_manager, lobby_manager, io);
        });

        socket.on("disconnect", () => {
            console.log(`❌ Player disconnecting: ${firebaseUid}`);
            handleDisconnect(socket, firebaseUid, player_manager, lobby_manager, io);
        });
    }

    function handleLeaveLobby(socket, firebaseUid, lobby_id, player_manager, lobby_manager, io) {
        const player = player_manager.get_player(firebaseUid);
        const lobby = lobby_manager.get_lobby(lobby_id);

        if (!lobby || !lobby.has_player(firebaseUid)) {
            socket.emit("error", "You are not in this lobby");
            return;
        }

        console.log(`👋 Player ${firebaseUid} leaving lobby ${lobby_id}`);

        lobby_manager.remove_player_from_lobby(lobby_id, player);
        socket.leave(lobby_id);
        delete socket.lobby_id;

        // Remove tank state
        if (lobby.tankStates) {
            delete lobby.tankStates[firebaseUid];
        }

        if (lobby.is_empty()) {
            lobby_manager.delete_lobby(lobby_id);
            console.log(`🗑️ Deleted empty lobby: ${lobby_id}`);
        } else {
            // Notify remaining players
            io.to(lobby_id).emit("update_lobby", {
                host_id: lobby.host_id,
                players: lobby.get_player_list(),
            });
            
            // Update tank states for remaining players
            io.to(lobby_id).emit("update_tanks", lobby.tankStates || {});
        }

        socket.emit("left_lobby", { lobby_id });
    }

    function handleDisconnect(socket, firebaseUid, player_manager, lobby_manager, io) {
        const player = player_manager.get_player(firebaseUid);
        const lobby_id = socket.lobby_id;

        if (lobby_id && firebaseUid) {
            handleLeaveLobby(socket, firebaseUid, lobby_id, player_manager, lobby_manager, io);
        }

        if (firebaseUid) {
            player_manager.remove_player(firebaseUid);
        }
        
        console.log(`❌ Disconnected: ${firebaseUid || socket.id}`);
    }
}