import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import GameCanvas from "../../components/GameCanvas";
import Chat from "../../components/Chat";

export default function GameRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const socketRef = useRef(null);

  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Connect socket once
    socketRef.current = io("http://localhost:4000");

    const username = localStorage.getItem("username");
    if (!username) {
      alert("Please set a username before joining a game.");
      router.push("/");
      return;
    }

    const isHostStored = localStorage.getItem("isHost") === "true";
    const maxPlayers = parseInt(localStorage.getItem("maxPlayers")) || 4;

    setIsHost(isHostStored);

    // Join the room with details
    socketRef.current.emit("joinRoom", {
      roomId,
      username,
      isHost: isHostStored,
      maxPlayers,
    });

    // Update player list when received
    const updatePlayersHandler = (updatedPlayers) => {
      setPlayers(updatedPlayers);
    };

    const roomFullHandler = () => {
      alert("Room is full! Redirecting to homepage.");
      router.push("/");
    };

    const gameStartedHandler = () => {
      setGameStarted(true);
    };

    socketRef.current.on("updatePlayers", updatePlayersHandler);
    socketRef.current.on("roomFull", roomFullHandler);
    socketRef.current.on("gameStarted", gameStartedHandler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("updatePlayers", updatePlayersHandler);
        socketRef.current.off("roomFull", roomFullHandler);
        socketRef.current.off("gameStarted", gameStartedHandler);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, router]);

  const handleStartGame = () => {
    if (socketRef.current) {
      socketRef.current.emit("startGame", roomId);
    }
  };

  const handleCancelGame = () => {
    if (socketRef.current) {
      socketRef.current.emit("cancelGame", roomId);
    }
    router.push("/");
  };

  if (!roomId) {
    return <div>Loading room...</div>;
  }

  if (gameStarted) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ width: "75%" }}>
          <GameCanvas socket={socketRef.current} roomId={roomId} />
        </div>
        <div style={{ width: "25%" }}>
          <Chat socket={socketRef.current} roomId={roomId} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Waiting Room</h1>
      <h2>Room ID: {roomId}</h2>
      <h3>Players in the Room:</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {players.map((player, idx) => (
          <li key={idx}>
            {player.username} {player.isHost ? "(Host)" : ""}
          </li>
        ))}
      </ul>

      {isHost && (
        <div style={{ marginTop: "2rem" }}>
          <button
            onClick={handleStartGame}
            style={{
              marginRight: "1rem",
              padding: "0.5rem 1.5rem",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Start Game
          </button>
          <button
            onClick={handleCancelGame}
            style={{
              padding: "0.5rem 1.5rem",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel Game
          </button>
        </div>
      )}
    </div>
  );
}
