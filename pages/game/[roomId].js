// pages/game/[roomId].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function GameRoom() {
    const router = useRouter();
    const { roomId } = router.query;
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!roomId) return;

        // connect only once
        if (!socket) {
            socket = io("http://localhost:4000"); // Match the port above
        }

        socket.emit("joinRoom", roomId);

        socket.on("roomJoined", () => {
            setConnected(true);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connect error:", err);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId]);

    return (
        <div style={{ textAlign: "center", marginTop: "5rem" }}>
            <h1>🎮 Room Code: {roomId}</h1>
            <p>
                {connected
                    ? "✅ Connected to room!"
                    : "⏳ Connecting to room..."}
            </p>
        </div>
    );
}
