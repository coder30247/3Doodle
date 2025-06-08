import { useState, useContext } from "react";
import { useRouter } from "next/router";
import { Socket_Context } from "../../lib/Socket.js";

export default function Join_Lobby_Button({ username }) {
    const [lobby_id, set_lobby_id] = useState("");
    const socket = useContext(Socket_Context);
    const router = useRouter();

    const handle_join_lobby = () => {
        if (lobby_id.length === 6) {
            socket.emit("join_lobby", {
                lobby_id,
                username,
            });
            socket.on("joined_success", ({ lobby_id }) => {
                router.push(`/lobby/${lobby_id}`);
            });
            socket.on("error", (message) => {
                alert(`Error: ${message}`);
            });
        } else {
            alert("Room ID must be exactly 6 characters.");
        }
    };

    return (
        <div className="w-full">
            <input
                type="text"
                value={lobby_id}
                onChange={(e) => set_lobby_id(e.target.value.toUpperCase())}
                placeholder="Enter Room ID"
                className="w-full p-2 border border-gray-300 rounded mb-2 uppercase tracking-widest text-center text-lg"
                maxLength={6}
                autoComplete="off"
            />
            <button
                onClick={handle_join_lobby}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200"
            >
                Join Room
            </button>
        </div>
    );
}
