import { useRouter } from "next/router";
import { useEffect } from "react";
import Socket_Store from "../../states/Socket_Store.js";
import Lobby_Store from "../../states/Lobby_Store.js";

export default function Lobby() {
    const router = useRouter();
    const { lobby_id } = router.query;
    const { socket } = Socket_Store();
    const { host_id, players, set_host_id, set_players } = Lobby_Store();

    useEffect(() => {
        if (!socket || !lobby_id) return;
        console.log(`Joining lobby: ${lobby_id}`);

        socket.on("update_lobby", ({ host_id, players }) => {
            console.log(`Host updated: ${host_id}`);
            console.log(
                `Received lobby update: players=${JSON.stringify(players)}`
            );
            set_players(players);
            set_host_id(host_id);
        });

        socket.on("error", (message) => {
            console.error(`Lobby error: ${message}`);
            router.push("/");
            alert(message);
        });

        return () => {
            if (socket && lobby_id) {
                socket.emit("leave_lobby", { lobby_id });
                socket.off("update_players");
                socket.off("error");
            }
        };
    }, [socket, lobby_id, set_host_id, set_players, router]);

    // 👇 handle exit click
    const handle_exit = () => {
        console.log(`Exiting lobby: ${lobby_id}`);
        if (socket && lobby_id) {
            socket.emit("leave_lobby", { lobby_id });
        }
        socket.on("left_lobby", () => {
            console.log(`Left lobby: ${lobby_id}`);
            router.push("/");
        });
    };

    return (
        <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-blue-600">
                Lobby: {lobby_id}
            </h1>
            <p className="text-gray-600">Host ID: {host_id}</p>
            <h2 className="text-xl font-semibold mt-4">Players in Lobby</h2>
            <ul className="list-disc pl-6 mt-2">
                {players.map((player) => (
                    <li key={player.id} className="text-gray-700">
                        {player.display_name || player.name}{" "}
                        {player.id === host_id ? "(Host)" : ""}
                    </li>
                ))}
            </ul>
            <button
                onClick={handle_exit}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
            >
                Exit Lobby
            </button>
        </div>
    );
}
