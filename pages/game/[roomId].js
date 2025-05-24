import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import io from "socket.io-client";
import Chat from "../../components/Chat";

const GameCanvas = dynamic(() => import("../../components/GameCanvas"), {
  ssr: false,
});

let socket;

export default function GameRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Initialize socket if not already created
    if (!socket) {
      socket = io("http://localhost:4000", {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("[SOCKET] Connected:", socket.id);
        setConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("[SOCKET] Disconnected");
        setConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("[SOCKET] Connection error:", err.message);
        setConnected(false);
      });
    }

    // Join room
    socket.emit("joinRoom", roomId);

    socket.on("roomJoined", () => {
      console.log("[SOCKET] Room joined:", roomId);
      setConnected(true);
    });

    // Handle room join errors
    socket.on("joinError", (error) => {
      console.error("[SOCKET] Join error:", error);
      setConnected(false);
    });

    return () => {
      socket.off("roomJoined");
      socket.off("joinError");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [roomId]);

  // Disconnect socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log("[SOCKET] Disconnecting socket");
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Game area */}
      <div style={{ flex: 3, position: "relative" }}>
        <h2 style={{ textAlign: "center" }}>🎮 Room: {roomId || "Loading..."}</h2>
        {connected ? (
          <GameCanvas socket={socket} roomId={roomId} />
        ) : (
          <p style={{ textAlign: "center" }}>
            ⏳ Connecting to room...
          </p>
        )}
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          borderLeft: "1px solid #ccc",
          padding: "1rem",
          overflowY: "auto",
          minWidth: "200px",
        }}
      >
        {connected && socket ? (
          <Chat socket={socket} roomId={roomId} />
        ) : (
          <p style={{ textAlign: "center" }}>
            ⏳ Connecting to chat...
          </p>
        )}
      </div>
    </div>
  );
}