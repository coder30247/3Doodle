export function game_handler(io, socket, player_manager, lobby_manager) {
    socket.on("start_game", ({ lobby_id }) => {
        const firebaseUid = socket.firebaseUid;

        if (!firebaseUid) {
            console.log(`❌ start_game without auth: ${socket.id}`);
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
                `❌ start_game failed — player not found: ${firebaseUid}`
            );
            socket.emit("error", "Player not found");
            return;
        }

        const lobby = lobby_manager.get_lobby(lobby_id);
        if (!lobby) {
            socket.emit("error", "Lobby not found");
            return;
        }

        if (lobby.host_id !== firebaseUid) {
            socket.emit("error", "Only host can start the game");
            return;
        }

        if (lobby.is_empty()) {
            socket.emit("error", "Cannot start an empty lobby");
            return;
        }

        // Notify all players in the lobby
        io.to(lobby_id).emit("game_started");
        console.log(`🎮 Game started in lobby: ${lobby_id}`);
    });

    socket.on("player:update_position", ({ room_id, x, y }) => {
        // Broadcast the updated position to all other players in the room
        socket.to(room_id).emit("player:position_update", {
            id: socket.id,
            x,
            y,
        });
    });

    socket.on("game:request_initial_players", ({ room_id }) => {
        const firebaseUid = socket.firebaseUid;
        const lobby = lobby_manager.get_lobby(room_id);

        if (!lobby || !lobby.has_player(firebaseUid)) {
            socket.emit("error", "Not in this lobby");
            return;
        }

        const players = lobby.get_player_list().map((player) => ({
            uid: player.firebaseUid,
            x: 100, // Default position
            y: 450,
        }));

        socket.emit("game:initial_players", { players });
    });
}
