import { useEffect, useState } from "react";
import Socket_Store from "../states/Socket_Store";
import User_Store from "../states/User_Store";

export default function Global_Chat() {
    const { username } = User_Store();

    const { socket } = Socket_Store.getState();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        socket.on("global_chat:broadcast", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on("global_chat:players", (data) => {
            setPlayers(data);
        });

        return () => {
            socket.off("global_chat:broadcast");
            socket.off("global_chat:players");
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit("global_chat:send", { username, message });
            setMessage("");
        }
    };

    return (
        <div className="fixed right-4 top-4 w-80 bg-white shadow-xl rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Global Chat
            </h3>
            <div className="mb-2 text-sm text-gray-500">
                Online: {players.map((p) => p.name).join(", ")}
            </div>

            <div className="h-48 overflow-y-auto border border-gray-300 rounded mb-2 p-2 text-sm">
                {messages.map((m, i) => (
                    <div key={i} className="mb-1">
                        <span className="font-bold">{m.sender}</span>:{" "}
                        {m.message}
                    </div>
                ))}
            </div>

            <div className="flex space-x-2">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Type a message..."
                />
                <button
                    onClick={sendMessage}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
