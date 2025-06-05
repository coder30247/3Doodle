const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const socketHandler = require("./Socket_Handler");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

socketHandler(io);

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`🎮 Server running at http://localhost:${PORT}`);
});
