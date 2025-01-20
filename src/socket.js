import { io } from "socket.io-client";

// Connecting to the Socket.IO server
const socket = io("https://votingapp-server-five.vercel.app", {
  transports: ["websocket"], // This forces the WebSocket connection
});

export default socket;
