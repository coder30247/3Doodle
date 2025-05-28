const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 4000;

const rooms = {}; // players per room
const chatHistory = {}; // messages per room

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  socket.on('joinRoom', ({ roomId, username, isHost, maxPlayers }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], maxPlayers: maxPlayers || 4 };
    }

    const room = rooms[roomId];
    if (room.players.length >= room.maxPlayers) {
      socket.emit('roomFull');
      return;
    }

    const player = { id: socket.id, username, isHost };
    room.players.push(player);
    socket.join(roomId);

    io.to(roomId).emit('updatePlayers', room.players);
    console.log(`${username} joined room ${roomId}`);
  });

  socket.on('startGame', (roomId) => {
    console.log(`🚀 Game started in room ${roomId}`);
    io.to(roomId).emit('gameStarted');
  });

  socket.on('cancelGame', (roomId) => {
    console.log(`❌ Game cancelled in room ${roomId}`);
    io.to(roomId).emit('gameCancelled');
  });

  socket.on("chatMessage", ({ roomId, username, text, timestamp }) => {
    console.log(`[${roomId}] ${username}: ${text}`);
    const message = { username, text, timestamp, reactions: {} };
    chatHistory[roomId] = chatHistory[roomId] || [];
    chatHistory[roomId].push(message);
    io.to(roomId).emit("chatMessage", message);
  });

  socket.on("getChatHistory", (roomId) => {
    socket.emit("chatHistory", chatHistory[roomId] || []);
  });

  socket.on("userTyping", ({ roomId, username }) => {
    socket.to(roomId).emit("userTyping", username);
  });

  socket.on("userStopTyping", ({ roomId, username }) => {
    socket.to(roomId).emit("userStopTyping", username);
  });

  socket.on("reaction", ({ roomId, messageId, emoji }) => {
    const message = chatHistory[roomId]?.[messageId];
    if (!message) return;
    message.reactions = message.reactions || {};
    message.reactions[emoji] = (message.reactions[emoji] || 0) + 1;
    io.to(roomId).emit("reaction", { messageId, emoji });
  });

  socket.on('draw', ({ roomId, points, drawerId }) => {
    socket.to(roomId).emit('draw', { points, drawerId });
  });

  socket.on('clearCanvas', (roomId) => {
    socket.to(roomId).emit('clearCanvas');
  });

  socket.on('wordSelected', ({ roomId, username, word }) => {
    console.log(`[${roomId}] ${username} selected word: ${word}`);
    // Broadcast to all in room
    io.to(roomId).emit('wordSelected', { username, word });
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        const disconnectedPlayer = room.players.splice(index, 1)[0];
        io.to(roomId).emit('updatePlayers', room.players);
        console.log(`${disconnectedPlayer.username} disconnected from room ${roomId}`);

        if (room.players.length === 0) {
          delete rooms[roomId];
          delete chatHistory[roomId];
          console.log(`🗑️ Deleted empty room ${roomId}`);
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🎮 Server listening on port ${PORT}`);
});
