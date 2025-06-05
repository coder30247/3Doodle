import { useState } from "react";
import { useRouter } from "next/router";

export default function CreateLobbyButton({ username, socket, logout }) {
    const [roomId, setRoomId] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const generateRoomId = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let id = "";
        for (let i = 0; i < 6; i++) {
            id += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return id;
    };

    const handleCreateLobby = () => {
        if (!username) {
            setError("Username is required");
            return;
        }
        if (!socket) {
            setError("Not connected to server");
            return;
        }
        setError(null);
        const newRoomId = generateRoomId();
        console.log(
            "Creating lobby with roomId:",
            newRoomId,
            "username:",
            username
        );
        socket.emit("create-lobby", { lobbyId: newRoomId, username });
        socket.on("lobby-created", ({ lobbyId, firebaseUid }) => {
            console.log("Lobby created:", lobbyId, "for user:", firebaseUid);
            router.push(`/lobby/${lobbyId}`);
        });
        socket.on("error", (message) => {
            console.error("Lobby creation error:", message);
            setError(message);
        });
    };

    const handleJoinLobby = () => {
        if (!username) {
            setError("Username is required");
            return;
        }
        if (!roomId) {
            setError("Room ID is required");
            return;
        }
        if (!socket) {
            setError("Not connected to server");
            return;
        }
        setError(null);
        console.log(
            "Joining lobby with roomId:",
            roomId,
            "username:",
            username
        );
        socket.emit("join-lobby", { lobbyId: roomId, username });
        socket.on("joined-success", ({ lobbyId, firebaseUid }) => {
            console.log("Joined lobby:", lobbyId, "for user:", firebaseUid);
            router.push(`/lobby/${lobbyId}`);
        });
        socket.on("error", (message) => {
            console.error("Join lobby error:", message);
            setError(message);
        });
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
                Welcome, {username}
            </h2>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-blue-300"
                onClick={handleCreateLobby}
                disabled={!username || !socket}
            >
                Create Lobby
            </button>
            <div className="flex space-x-2">
                <input
                    className="px-4 py-2 border rounded-md"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    maxLength={6}
                />
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-green-300"
                    onClick={handleJoinLobby}
                    disabled={!username || !roomId || !socket}
                >
                    Join Lobby
                </button>
            </div>
            <button
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                onClick={logout}
            >
                Logout
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
