import React from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
    console.log("Connected to server with id:", socket.id);
});

// Create a React context for socket
const SocketContext = React.createContext(socket);

export { socket, SocketContext };
