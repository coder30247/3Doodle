class Player {
    constructor(userId, name, socketId) {
        this.userId = userId; // Unique user identifier (string)
        this.name = name; // Player display name (string)
        this.socketId = socketId; // Current socket connection ID
        this.isReady = false; // Ready status for game start
        this.joinTime = new Date(); // When player joined the lobby
    }

    // Add any player-specific methods here if needed
}

module.exports = Player;
