// pages/game/[roomId].js
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Chat from "../../components/Chat";

// Lazy load your Three.js game to avoid SSR issues
const GameCanvas = dynamic(() => import("../../components/GameCanvas"), { ssr: false });

let socket;

export default function GameRoom() {
    const router = useRouter();
    const { roomId } = router.query;
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!roomId) return;

        if (!socket) {
            socket = io("http://localhost:4000");
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

    if (!roomId) return <p>Loading...</p>;

    return (
        <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
            <div style={{ flex: 3, border: "1px solid #ddd", padding: "1rem" }}>
                <h1>🎮 Room: {roomId}</h1>
                {!connected ? (
                    <p>⏳ Connecting to room...</p>
                ) : (
                    <GameCanvas socket={socket} roomId={roomId} />
                )}
            </div>

            <div style={{ flex: 1, maxWidth: "350px" }}>
                <Chat roomId={roomId} />
            </div>
        </div>
    );
}
