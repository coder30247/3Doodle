// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const socketHandler = require('./socketHandler'); // ✅ import the handler

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Your frontend
    methods: ['GET', 'POST'],
  },
});

// 💥 call the handler
socketHandler(io);

server.listen(4000, () => {
  console.log('Socket.IO server running on http://localhost:4000');
});
