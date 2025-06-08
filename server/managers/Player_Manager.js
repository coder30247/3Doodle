import Player from "../models/Player.js";

export default class Player_Manager {
    constructor() {
        this.players = new Map(); // map of firebase uid to player instance
    }

    add_player({ id, name, socket_id, is_host = false }) {
        if (this.players.has(id)) {
            throw new Error(`Player with ID ${id} already exists`);
        }
        const player = new Player({ id, name, socket_id, is_host });
        this.players.set(id, player);
        return player;
    }

    get_player(id) {
        return this.players.get(id);
    }

    remove_player(id) {
        return this.players.delete(id);
    }

    update_socket_id(id, new_socket_id) {
        const player = this.get_player(id);
        if (player) {
            player.update_socket_id(new_socket_id);
        }
    }

    get_all_players() {
        return Array.from(this.players.values());
    }

    promote_to_host(id) {
        const player = this.get_player(id);
        if (player) {
            player.promote_to_host();
        }
    }

    clear_all() {
        this.players.clear();
    }
}
