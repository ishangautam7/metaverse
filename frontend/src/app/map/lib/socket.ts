import { io, Socket } from "socket.io-client";

// const BACKEND_URL =
//   process.env.NODE_ENV === "prod"
//     ? "https://metaverse-lrym.onrender.com"
//     : typeof window !== "undefined" &&
//       window.location.hostname.startsWith("192.168.")
//     ? "http://192.168.1.5:4000"
//     : "http://localhost:4000";

const BACKEND_URL = "https://metaverse-lrym.onrender.com"

export const socket: Socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  upgrade: true,
  rememberUpgrade: true,
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
  forceNew: false
});