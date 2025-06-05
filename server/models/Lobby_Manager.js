const Player = require("./Player");

// Utility function to generate a unique lobby ID
function generateLobbyId() {
    return "lobby-" + Math.random().toString(36).substr(2, 9);
}

// Placeholder for password hashing function
function hashPassword(password) {
    // Implement your hashing here (e.g., bcrypt)
    return password; // For now, just return plain password (NOT safe for production)
}

// Game lobby storage using Map
const activeLobbies = new Map();

/*
Lobby Structure:
{
  id: string,                // Unique lobby ID (e.g., "lobby-abc123")
  name: string,              // Lobby display name (e.g., "Epic Battle")
  maxPlayers: number,        // 2-8 typically
  players: Map<string, Player>, // Key: userID, Value: Player instance
  isPrivate: boolean,        // true/false for password protection
  createdAt: Date,           // Lobby creation timestamp
  gameState: 'lobby' | 'starting' | 'in-game' | 'finished', // Current state
  password?: string          // Optional password (hashed in real implementation)
}
*/

// Create a new game lobby
function createLobby(lobbyConfig) {
    const lobby = {
        id: generateLobbyId(),
        name: lobbyConfig.name || `Lobby ${Math.floor(Math.random() * 1000)}`,
        maxPlayers: Math.min(Math.max(lobbyConfig.maxPlayers || 10, 2), 8), // clamp between 2 and 8
        players: new Map(), // userId -> Player instance
        isPrivate: Boolean(lobbyConfig.password),
        createdAt: new Date(),
        gameState: "lobby",
        ...(lobbyConfig.password && {
            password: hashPassword(lobbyConfig.password),
        }),
    };

    activeLobbies.set(lobby.id, lobby);
    return lobby;
}

// Export the lobby manager utilities
module.exports = {
    Player,
    activeLobbies,
    generateLobbyId,
    hashPassword,
//    cleanupLobby,
};
