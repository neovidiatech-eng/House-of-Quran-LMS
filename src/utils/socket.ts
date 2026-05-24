import { io, Socket } from "socket.io-client";
import { baseURL } from "../consts";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  // If socket already exists, check if token is the same
  if (socket) {
    if ((socket as any).auth?.token === token) {
      return socket;
    }
    // If token changed, disconnect and reconnect
    socket.disconnect();
    socket = null;
  }

  console.log("🔌 Connecting socket with token...");

  socket = io(baseURL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket Connected successfully:", socket?.id);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket Connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket Disconnected:", reason);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  if (socket) return socket;

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    return connectSocket(token);
  }
  
  return null;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};