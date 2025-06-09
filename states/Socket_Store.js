// states/Socket_Store.js
import { create } from "zustand";

const Socket_Store = create((set) => ({
    socket: null,
    connected: false,

    set_socket: (socket_instance) => set({ socket: socket_instance }),
    set_connected: (val) => set({ connected: val }),
    reset_socket: () => set({ socket: null, connected: false }),
}));

const set_socket = (socket_instance) =>
    Socket_Store.getState().set_socket(socket_instance);
const set_connected = (val) => Socket_Store.getState().set_connected(val);
const clear_socket = () => Socket_Store.getState().reset_socket();

export default Socket_Store;
export { set_socket, set_connected, clear_socket };
