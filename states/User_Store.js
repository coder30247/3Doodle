// states/User_Store.js
import { create } from "zustand";

const User_Store = create((set) => ({
    username: "",
    is_host: false,
    max_players: 4,

    set_username: (name) => set({ username: name }),
    set_is_host: (val) => set({ is_host: val }),
    set_max_players: (num) => set({ max_players: num }),

    reset_user: () => set({ username: "", is_host: false, max_players: 4 }),
}));

const set_username = (name) => User_Store.getState().set_username(name);
const set_is_host = (val) => User_Store.getState().set_is_host(val);
const set_max_players = (num) => User_Store.getState().set_max_players(num);
const reset_user = () => User_Store.getState().reset_user();

export default User_Store;
export { set_username, set_is_host, set_max_players, reset_user };
