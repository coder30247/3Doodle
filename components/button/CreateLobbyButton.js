export default function CreateLobbyButton({ username }) {
  const handleCreate = () => {
    console.log(`Creating room as ${username}`);
    // TODO: Room creation logic
  };

  return (
    <button
      onClick={handleCreate}
      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
    >
      Create Room
    </button>
  );
}
