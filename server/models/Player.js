export default class Player {
    constructor({ id, name, socket_id }) {
        this.id = id; // firebase uid
        this.name = name.trim();
        this.socket_id = socket_id;
        this.is_ready = false;
    }

    update_name(new_name) {
        this.name = new_name.trim();
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
