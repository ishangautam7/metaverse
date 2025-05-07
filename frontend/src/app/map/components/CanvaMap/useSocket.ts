import { useEffect, useState } from "react";
import { PlayersMap } from "./types";
import { socket } from "../../lib/socket";

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

  useEffect(() => {
    socket.emit("join", { mapUID, user: { username } });

    socket.on("playersUpdate", (players: PlayersMap) => {
      setPlayers(players);
    });

    socket.on("chatMsg", (msg: ChatMessage) => {
      setChatHistory(prev => [...prev, msg]);
    });

    // Load chat history when joining
    socket.emit("getChatHistory", { mapUID });

    socket.on("chatHistory", (history: ChatMessage[]) => {
      setChatHistory(history);
    });

    return () => {
      socket.off("playersUpdate");
      socket.off("chatMsg");
      socket.off("chatHistory");
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