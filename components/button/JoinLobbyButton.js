import { useRouter } from "next/router";
import socket from "../../lib/socket";

export default function JoinLobbyButton({ username }) {
  const router = useRouter();

  const handleJoin = () => {
    const roomId = prompt("Enter Room ID to join:");
    if (roomId && roomId.trim().length === 6) {
      socket.emit("joinRoom", { roomId: roomId.toUpperCase(), username, isHost: false });
      router.push(`/lobby/${roomId}`);
    } else {
      alert("Room ID must be 6 characters.");
    }
  };

  return (
    <button onClick={handleJoin} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
      Join Room
    </button>
  );
}
