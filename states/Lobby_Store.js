// states/Lobby_Store.js
import { create } from "zustand";

const Lobby_Store = create((set) => ({
    lobby_id: null,
    players: [],
    host_id: null,
    max_players: 4,

    set_lobby_id: (id) => set({ lobby_id: id }),
    set_players: (players_list) => set({ players: players_list }),
    set_host_id: (id) => set({ host_id: id }),
    set_max_players: (num) => set({ max_players: num }),

    reset_lobby: () =>
        set({
            lobby_id: null,
            players: [],
            host_id: null,
            max_players: 4,
        }),
}));

const set_lobby_id = (id) => Lobby_Store.getState().set_lobby_id(id);
const set_players = (players_list) =>
    Lobby_Store.getState().set_players(players_list);
const set_host_id = (id) => Lobby_Store.getState().set_host_id(id);
const set_max_players = (num) => Lobby_Store.getState().set_max_players(num);
const reset_lobby = () => Lobby_Store.getState().reset_lobby();

export default Lobby_Store;
export { set_lobby_id, set_players, set_host_id, set_max_players, reset_lobby };
