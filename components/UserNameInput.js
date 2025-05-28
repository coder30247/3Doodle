export default function UsernameInput({ username, setUsername }) {
    return (
        <input
            className="border border-gray-300 rounded px-4 py-2 w-full"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
    );
}
