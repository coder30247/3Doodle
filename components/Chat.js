// components/Chat.js
import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function Chat({ roomId }) {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!roomId) return;

        if (!socket) {
            socket = io("http://localhost:4000");
        }

        socket.emit("joinRoom", roomId);

        socket.on("chatMessage", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off("chatMessage");
        };
    }, [roomId]);

    const sendMessage = () => {
        if (message.trim() === "" || username.trim() === "") return;

        socket.emit("chatMessage", { roomId, username, message });
        setMessage("");
    };

    return (
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
            <h3>Chat Room: {roomId}</h3>
            <input
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginBottom: "0.5rem", width: "100%" }}
            />
            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ marginBottom: "0.5rem", width: "100%" }}
            />
            <button onClick={sendMessage} style={{ width: "100%" }}>
                Send
            </button>
            <ul style={{ listStyle: "none", paddingLeft: 0, maxHeight: "200px", overflowY: "auto", marginTop: "1rem" }}>
                {messages.map((msg, idx) => (
                    <li key={idx}>
                        <strong>{msg.username}:</strong> {msg.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}
