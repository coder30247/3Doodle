export default class Lobby {
    constructor(lobby_id, host_player, max_players = 8, name = "") {
        this.id = lobby_id; // unique lobby identifier
        this.name = name ? name.trim() : `lobby-${lobby_id}`; // lobby display name
        this.host_id = host_player.id; // host player id
        this.max_players = max_players; // maximum player limit
        this.players = new Map(); // map of player id to player object
        this.created_at = new Date(); // creation timestamp
        this.game_state = "lobby"; // state: lobby, in_game, finished
        this.add_player(host_player);
    }

    add_player(player) {
        if (this.players.size >= this.max_players) {
            throw new Error("Lobby is full");
        }
        if (this.players.has(player.id)) {
            throw new Error("Player already in lobby");
        }
        player.is_host = player.id === this.host_id;
        this.players.set(player.id, player);
    }

    remove_player(player_id) {
        const player = this.players.get(player_id);
        if (player) {
            this.players.delete(player_id);
            if (player.is_host && this.players.size > 0) {
                this.assign_new_host();
            }
        }
    }

    assign_new_host() {
        const new_host = this.get_player_list()[0];
        if (new_host) {
            new_host.promote_to_host();
            this.host_id = new_host.id;
        }
    }

    is_empty() {
        return this.players.size === 0;
    }

    get_player_list() {
        return Array.from(this.players.values());
    }

    has_player(player_id) {
        return this.players.has(player_id);
    }

    set_game_state(state) {
        const valid_states = ["lobby", "in_game", "finished"];
        if (!valid_states.includes(state)) {
            throw new Error(`Invalid game state: ${state}`);
        }
        this.game_state = state;
    }
}
