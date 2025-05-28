export default function JoinRoomButton({ username }) {
  const handleJoin = () => {
    const roomId = prompt('Enter Room ID to join:');
    if (roomId && roomId.trim()) {
      console.log(`Joining room ${roomId} as ${username}`);
      // TODO: Room join logic
    }
  };

  return (
    <button
      onClick={handleJoin}
      className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
    >
      Join Room
    </button>
  );
}
