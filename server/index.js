import express from "express";
import { Server } from "socket.io";
import http from "http";
import { socket_handler } from "./Socket_Handler.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
    ping_timeout: 5000,
    ping_interval: 10000,
});

app.use(express.static("public"));

socket_handler(io);

server.listen(4000, () => {
    console.log("🎮 Server running at http://localhost:4000");
});
