import { useEffect, useState, useRef } from "react";
import { PlayersMap } from "./types";
import { socket } from "../../lib/socket";
import { SocketAddress } from "net";

interface UseSocketProps {
  mapUID: number;
  username: string;
  position: { x: number; y: number };
}

interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

export const useSocket = ({ mapUID, username, position }: UseSocketProps) => {
  const [players, setPlayers] = useState<PlayersMap>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      return null;
    }
  };

  useEffect(() => {
    socket.emit("join", { mapUID, user: { username } });
    socket.emit("move", { mapUID, position });
    const setupConnections = async () => {
      await initializeLocalStream();
    };

    // setupConnections();

    socket.on("playersUpdate", (newPlayers: PlayersMap) => {
      setPlayers(newPlayers);
    });

    socket.on("chatMsg", (msg: ChatMessage) => {
      setChatHistory(prev => [...prev, msg]);
    });

    socket.emit("getChatHistory", { mapUID });

    socket.on("chatHistory", (history: ChatMessage[]) => {
      setChatHistory(history);
    });

    return () => {
      socket.off("playersUpdate");
      socket.off("chatMsg");
      socket.off("chatHistory");
      socket.off("playerLeft");
    };
  }, []);

  useEffect(() => {
    socket.emit("move", { mapUID, position });
  }, [position]);

  const sendChatMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    socket.emit("chat", { mapUID, message, timestamp });
  };

  return { players, chatHistory, sendChatMessage };
};