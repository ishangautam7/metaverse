import { io } from "socket.io-client";
import { host } from "./Routes";
export const socket = io(process.env.NEXT_PUBLIC_API_URL || host)