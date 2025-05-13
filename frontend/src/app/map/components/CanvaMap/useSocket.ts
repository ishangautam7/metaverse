import { useEffect, useState, useRef } from "react";
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
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
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

  const createPeerConnection = async (userId: string) => {
    if (peerConnectionsRef.current[userId]) {
      console.log("Peer connection already exists for:", userId);
      return peerConnectionsRef.current[userId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ]
    });

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

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

    peerConnectionsRef.current[userId] = pc;
    return pc;
  };

  const handleNewPlayer = async (userId: string) => {
    if (userId === socket.id) return;
    
    try {
      const pc = await createPeerConnection(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc-offer", { to: userId, offer, mapUID });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  useEffect(() => {
    const setupConnections = async () => {
      await initializeLocalStream();
      socket.emit("join", { mapUID, user: { username } });
    };

    setupConnections();

    socket.on("playersUpdate", (newPlayers: PlayersMap) => {
      setPlayers(newPlayers);
      // Handle new players
      Object.keys(newPlayers).forEach(playerId => {
        if (playerId !== socket.id && !peerConnectionsRef.current[playerId]) {
          handleNewPlayer(playerId);
        }
      });
    });

    socket.on("chatMsg", (msg: ChatMessage) => {
      setChatHistory(prev => [...prev, msg]);
    });

    socket.on("webrtc-offer", async ({ from, offer }) => {
      try {
        const pc = await createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { to: from, answer, mapUID });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on("webrtc-answer", async ({ from, answer }) => {
      try {
        const pc = peerConnectionsRef.current[from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    socket.on("webrtc-ice", async ({ from, candidate }) => {
      try {
        const pc = peerConnectionsRef.current[from];
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    });

    socket.on("playerLeft", (userId: string) => {
      if (peerConnectionsRef.current[userId]) {
        peerConnectionsRef.current[userId].close();
        delete peerConnectionsRef.current[userId];
        setPeerStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[userId];
          return newStreams;
        });
      }
    });

    socket.emit("getChatHistory", { mapUID });

    socket.on("chatHistory", (history: ChatMessage[]) => {
      setChatHistory(history);
    });

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {};
      socket.off("playersUpdate");
      socket.off("chatMsg");
      socket.off("chatHistory");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
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

  return { players, chatHistory, sendChatMessage, peerStreams };
};