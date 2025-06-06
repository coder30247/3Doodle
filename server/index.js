const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const socketHandler = require("./Socket_Handler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
    pingTimeout: 5000,
    pingInterval: 10000,
});

app.use(express.static("public"));

socketHandler(io);

server.listen(4000, () => {
    console.log("🎮 Server running at http://localhost:4000");
});
