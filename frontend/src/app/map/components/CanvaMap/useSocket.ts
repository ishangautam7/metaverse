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
  const [peerStreams, setPeerStreams] = useState<Record<string, MediaStream>>({});
  const [peerConnections, setPeerConnections] = useState<Record<string, RTCPeerConnection>>({});

  useEffect(() => {
    socket.emit("join", { mapUID, user: { username } });

    socket.on("playersUpdate", (players: PlayersMap) => {
      setPlayers(players);
    });

    socket.on("chatMsg", (msg: ChatMessage) => {
      setChatHistory(prev => [...prev, msg]);
    });

    socket.on("webrtc-offer", async ({ from, offer }) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc-answer", { to: from, answer, mapUID });
    });

    socket.on("webrtc-answer", async ({ from, answer }) => {
      const pc = peerConnections[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("webrtc-ice", async ({ from, candidate }) => {
      const pc = peerConnections[from];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("playerLeft", (userId: string) => {
      if (peerConnections[userId]) {
        peerConnections[userId].close();
        const newPeerConnections = { ...peerConnections };
        delete newPeerConnections[userId];
        setPeerConnections(newPeerConnections);

        const newPeerStreams = { ...peerStreams };
        delete newPeerStreams[userId];
        setPeerStreams(newPeerStreams);
      }
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
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
      socket.off("playerLeft");

      // Clean up peer connections
      Object.values(peerConnections).forEach(pc => pc.close());
    };
  }, []);

  const createPeerConnection = (userId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice", {
          to: userId,
          candidate: event.candidate,
          mapUID
        });
      }
    };

    pc.ontrack = (event) => {
      setPeerStreams(prev => ({
        ...prev,
        [userId]: event.streams[0]
      }));
    };

    setPeerConnections(prev => ({
      ...prev,
      [userId]: pc
    }));

    return pc;
  };

  useEffect(() => {
    socket.emit("move", { mapUID, position });
  }, [position]);

  const sendChatMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    socket.emit("chat", { mapUID, message, timestamp });
  };

  return { players, chatHistory, sendChatMessage, peerStreams };
};