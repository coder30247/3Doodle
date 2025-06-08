import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Socket_Context } from "../../lib/Socket.js";

export default function Lobby() {
    const router = useRouter();
    const { lobbyId } = router.query;
    const socket = useContext(Socket_Context);

    const [hostId, setHostId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!socket || !lobbyId) return;

        socket.on ("lobby_created",({lobbyId, firebaseUid}) => {
            console.log(`Joined lobby: ${lobbyId} as host: ${firebaseUid}`);
            setLoading(false);
          });

        // Receive updated player list
        socket.on("lobbyUpdate", ({ host, players }) => {
            setHostId(host);
            setPlayers(players);
            setLoading(false);
        });

        // Handle disconnect or leaving lobby cleanup
        return () => {
            socket.emit("leaveRoom", { lobbyId });
            socket.off("lobbyUpdate");
        };
    }, [socket, lobbyId]);

    if (loading) return <p>Loading lobby...</p>;

    return (
        <div>
            <h1>Lobby: {lobbyId}</h1>
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
