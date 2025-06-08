export default class Player {
    constructor({ id, name, socket_id, is_host = false }) {
        this.id = id; // firebase uid
        this.name = name.trim(); // display name
        this.socket_id = socket_id; // current socket id
        this.is_ready = false; // ready for game start
        this.is_host = !!is_host; // host status
    }

    mark_ready() {
        this.is_ready = true;
    }

    mark_not_ready() {
        this.is_ready = false;
    }

    update_socket_id(new_socket_id) {
        this.socket_id = new_socket_id;
    }

    promote_to_host() {
        this.is_host = true;
    }

    demote_from_host() {
        this.is_host = false;
    }
}
