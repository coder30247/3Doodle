class Player {
    constructor(id, name, socketId) {
        this.id = id; // Firebase UID
        this.name = name; // Player display name (string)
        this.socketId = socketId; // Current socket connection ID
        this.isReady = false; // Ready status for game start
        this.joinTime = new Date(); // When player joined the lobby
        this.isHost = false; // Add isHost property to match Socket_Handler.js
    }
}

module.exports = Player;
