import { io } from "socket.io-client";

// Make sure the URL is correct and points to your deployed server
const socket = io("https://votingapp-server-five.vercel.app", {
  transports: ["websocket"],
});

export default socket;
