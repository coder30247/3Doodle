import React, { createContext, useContext, useState, useEffect } from "react";

const User_Context = createContext();

export function User_Provider({ children }) {
    const [username, set_username] = useState("");
    const [is_host, set_is_host] = useState(false);
    const [max_players, set_max_players] = useState(4);

    // load from localStorage on mount
    useEffect(() => {
        const stored_username = localStorage.getItem("username");
        const stored_is_host = localStorage.getItem("is_host") === "true";
        const stored_max_players = parseInt(
            localStorage.getItem("max_players"),
            10
        );

        if (stored_username) set_username(stored_username);
        if (stored_is_host) set_is_host(true);
        if (stored_max_players && !isNaN(stored_max_players))
            set_max_players(stored_max_players);
    }, []);

    // save to localStorage when changes
    useEffect(() => {
        if (username) localStorage.setItem("username", username);
        localStorage.setItem("is_host", is_host);
        localStorage.setItem("max_players", max_players);
    }, [username, is_host, max_players]);

    return (
        <User_Context.Provider
            value={{
                username,
                set_username,
                is_host,
                set_is_host,
                max_players,
                set_max_players,
            }}
        >
            {children}
        </User_Context.Provider>
    );
}

export const use_user = () => useContext(User_Context);
