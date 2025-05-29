import { useState } from "react";
import UsernameInput from "./UsernameInput";
import CreateRoomButton from "./button/CreateLobbyButton";
import JoinRoomButton from "./button/JoinLobbyButton";

export default function Lobby_Menu() {
    const [username, setUsername] = useState("");

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-gray-700">
                Enter Your Username
            </h2>
            <UsernameInput username={username} setUsername={setUsername} />

            {username.trim() !== "" && (
                <div className="w-full space-y-4">
                    <CreateRoomButton username={username} />
                    <JoinRoomButton username={username} />
                </div>
            )}
        </div>
    );
}
