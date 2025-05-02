import { io, Socket } from "socket.io-client";

const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://metaverse-kz5d.onrender.com"
    : typeof window !== "undefined" &&
      window.location.hostname.startsWith("192.168.")
    ? "http://192.168.101.9:4000"
    : "http://localhost:4000";

export const socket: Socket = io(BACKEND_URL);
