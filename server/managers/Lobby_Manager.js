import Lobby from "../models/Lobby.js";

export default class Lobby_Manager {
    constructor() {
        this.lobbies = new Map(); // map of lobby id to lobby instance
    }

    create_lobby({ host, max_players = 8, name = "" }) {
        const lobby_id = crypto.randomUUID(); // generate unique lobby id
        const lobby = new Lobby(lobby_id, host, max_players, name);
        this.lobbies.set(lobby_id, lobby);
        return lobby;
    }

    get_lobby(lobby_id) {
        return this.lobbies.get(lobby_id);
    }

    delete_lobby(lobby_id) {
        this.lobbies.delete(lobby_id);
    }

    add_player_to_lobby(lobby_id, player) {
        const lobby = this.get_lobby(lobby_id);
        if (!lobby) {
            throw new Error(`Lobby ${lobby_id} not found`);
        }
        lobby.add_player(player);
        return lobby;
    }

    remove_player_from_lobbies(player) {
        for (const [lobby_id, lobby] of this.lobbies) {
            if (lobby.has_player(player.id)) {
                lobby.remove_player(player.id);
                if (lobby.is_empty()) {
                    this.delete_lobby(lobby_id);
                }
                break;
            }
        }
    }

    get_all_lobbies() {
        return Array.from(this.lobbies.values());
    }

    lobby_exists(lobby_id) {
        return this.lobbies.has(lobby_id);
    }
}
