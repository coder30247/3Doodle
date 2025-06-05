const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const socketHandler = require("./Socket_Handler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your Next.js app URL
    methods: ["GET", "POST"],
  },
  pingTimeout: 5000, // Disconnect inactive clients after 5 seconds
  pingInterval: 10000, // Ping clients every 10 seconds
});

// Serve static assets to avoid logging as connections
app.use(express.static("public"));

// Handle Socket.IO
socketHandler(io);

server.listen(4000, () => {
  console.log("🎮 Server running at http://localhost:4000");
});