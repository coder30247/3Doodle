import Socket_Store from "../../states/Socket_Store.js";

export default function Start_Game_Button({ user_id, host_id, lobby_id }) {
    const { socket } = Socket_Store();

    if (!user_id || !host_id || user_id !== host_id) return null;

    const handle_start_game = () => {
        if (socket && lobby_id) {
            socket.emit("start_game", { lobby_id });
        }
    };

    return (
        <button
            onClick={handle_start_game}
            style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "green",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer"
            }}
        >
            Start Game
        </button>
    );
}