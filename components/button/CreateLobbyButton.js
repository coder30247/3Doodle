import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { SocketContext } from "../../lib/socket";

// Generate a 6-letter uppercase roomId
const generateRoomId = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array.from({ length: 6 }, () =>
        letters.charAt(Math.floor(Math.random() * letters.length))
    ).join("");
};

export default function CreateLobbyButton({ username }) {
    const router = useRouter();
    const socket = useContext(SocketContext);

    useEffect(() => {
        if (!socket) return;

        const handleLobbyCreated = ({ roomId, userId }) => {
            localStorage.setItem("userId", userId);
            router.push(`/lobby/${roomId}`);
        };

        socket.on("lobby-created", handleLobbyCreated);

        return () => {
            socket.off("lobby-created", handleLobbyCreated);
        };
    }, [socket, router]);

    const handleCreateLobby = () => {
        console.log("Creating lobby with username:", username);
        if (!username || username.trim() === "") return;

        const roomId = generateRoomId();
        localStorage.setItem("username", username.trim());

        socket.emit("create-lobby", {
            roomId,
            username: username.trim(),
        });
    };

    return (
        <button
            onClick={handleCreateLobby}
            disabled={!username.trim()}
            className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded ${
                !username.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
            }`}
        >
            Create Lobby
        </button>
    );
}
