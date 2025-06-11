export default class Player {
    constructor({ id, name, socket_id, is_host = false }) {
        this.id = id; // firebase uid
        this.name = name.trim(); // display name
        this.socket_id = socket_id; // current socket id
        this.is_ready = false; // ready for game start
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
}
