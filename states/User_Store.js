// states/User_Store.js
import { create } from "zustand";

const User_Store = create((set) => ({
    user_id: "",
    username: "",
    is_host: false,
    max_players: 4,

    set_user_id: (id) => set({ user_id: id }),
    set_username: (name) => set({ username: name }),
    set_is_host: (val) => set({ is_host: val }),
    set_max_players: (num) => set({ max_players: num }),
    set_user: ({ user_id, username, is_host, max_players }) =>
        set({ user_id, username, is_host, max_players }),
    reset_user: () => set({ user_id: "", username: "", is_host: false, max_players: 4 }),
}));

const set_user_id = (id) => User_Store.getState().set_user_id(id);

export default User_Store;
export { set_user_id };


