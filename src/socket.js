import { io } from "socket.io-client";

// Make sure the URL is correct and points to your deployed server
const socket = io("https://votingapp-server-five.vercel.app", {
  transports: ["websocket"],
});

// Handle connection errors
socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("connect", () => {
  console.log("Connected to the socket server.");
});

socket.on("disconnect", () => {
  console.log("Disconnected from the socket server.");
});

export default socket;
