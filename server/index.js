const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Adjust if your frontend runs on a different origin
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('message', { text: `User ${socket.id} joined` });
  });

  socket.on('message', (data) => {
    const roomId = [...socket.rooms][1]; // The first room is the socket's own room
    io.to(roomId).emit('message', data);
  });

  socket.on('draw', (data) => {
    const roomId = [...socket.rooms][1];
    socket.to(roomId).emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('✅ Socket.IO server running on http://localhost:3001');
});
