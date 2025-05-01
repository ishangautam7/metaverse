import { io, Socket } from "socket.io-client";

export const socket: Socket = io("https://metaverse-kz5d.onrender.com/");
// export const socket: Socket = io("http://localhost:4000");