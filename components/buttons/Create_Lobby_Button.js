import { useState, useContext } from "react";
import { useRouter } from "next/router";
import { Socket_Context } from "../../lib/Socket.js";

export default function Create_Lobby_Button({ username }) {
    const [error, set_error] = useState(null);
    const router = useRouter();
    const socket = useContext(Socket_Context);

    const generate_id = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let id = "";
        for (let i = 0; i < 6; i++) {
            id += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return id;
    };

    const handle_create_lobby = () => {
        if (!username) {
            set_error("Username is required");
            return;
        }
        if (!socket) {
            set_error("Not connected to server");
            return;
        }
        set_error(null);
        const lobby_id = generate_id();
        console.log(
            `Creating lobby with lobby_id: ${lobby_id}, username: ${username}`
        );
        socket.emit("create_lobby", { lobby_id, username });

        socket.on("lobby_created", ({ lobby_id, firebase_uid }) => {
            console.log(
                `Lobby created: ${lobby_id}, for user: ${firebase_uid}`
            );
            router.push(`/lobby/${lobby_id}`);
        });
        socket.on("error", (message) => {
            console.error(`Lobby creation error: ${message}`);
            set_error(message);
        });
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-blue-300"
                onClick={handle_create_lobby}
                disabled={!username || !socket}
            >
                Create Lobby
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
