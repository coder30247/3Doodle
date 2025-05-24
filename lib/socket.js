import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3001'); // or your server address
  }
  return socket;
};

export const getSocket = () => socket;
