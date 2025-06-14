import Player_Manager from "../managers/Player_Manager.js";
import Lobby_Manager from "../managers/Lobby_Manager.js";
import { lobby_handler } from "./Lobby_Handler.js";
import { global_chat_handler } from "./Global_Chat_Handler.js";
import { lobby_chat_handler } from "./Lobby_Chat_Handler.js";
import { game_handler } from "./Game_Handler.js";

export function auth_handler(io, socket, player_manager, lobby_manager) {
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

        // Register other event handlers only after authentication
        lobby_handler(io, socket, player_manager, lobby_manager);
        global_chat_handler(io, socket, player_manager);
        lobby_chat_handler(io, socket, player_manager, lobby_manager);
        game_handler(io, socket, player_manager, lobby_manager);
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

                // Notify other players in the lobby
                io.to(lobby_id).emit("player:remove", { uid: firebaseUid });

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
}
