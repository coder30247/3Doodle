import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../lib/socket";

export default function Lobby() {
  const router = useRouter();
  const { roomId } = router.query;
  const socket = useContext(SocketContext);

  const [hostId, setHostId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join the room
    socket.emit("joinRoom", { roomId });

    // Receive updated player list
    socket.on("lobbyUpdate", ({ host, players }) => {
      setHostId(host);
      setPlayers(players);
      setLoading(false);
    });

    // Handle disconnect or leaving lobby cleanup
    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.off("lobbyUpdate");
    };
  }, [socket, roomId]);

  if (loading) return <p>Loading lobby...</p>;

  return (
    <div>
      <h1>Lobby: {roomId}</h1>
      <p>Host ID: {hostId}</p>
      <h2>Players in Lobby:</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name} {player.id === hostId ? "(Host)" : ""}
          </li>
        ))}
      </ul>
      <button onClick={() => router.push("/")}>Exit Lobby</button>
    </div>
  );
}
