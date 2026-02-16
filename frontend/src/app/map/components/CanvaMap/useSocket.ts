import { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "../../lib/socket";
import { PlayersMap } from "./types";

type RemoteStreams = {
  [key: string]: {
    stream: MediaStream;
    username: string;
    position: { x: number; y: number };
  };
};

interface UseSocketProps {
  mapUID: number;
  username: string;
  position: { x: number; y: number };
  localStream: MediaStream | null;
  setRemoteStreams: React.Dispatch<React.SetStateAction<RemoteStreams>>;
}

export const useSocket = ({ mapUID, username, position, localStream, setRemoteStreams }: UseSocketProps) => {
  const [players, setPlayers] = useState<PlayersMap>({});
  const [chatHistory, setChatHistory] = useState<Array<{ username: string; message: string; timestamp: string }>>([]);
  const peerConnectionsRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const iceCandidateBufferRef = useRef<{ [id: string]: RTCIceCandidateInit[] }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const hasJoinedRef = useRef(false);
  const socketIdRef = useRef<string | null>(null);
  const playersRef = useRef<PlayersMap>({});

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // Store socket ID for reference
  useEffect(() => {
    const handleConnect = () => {
      socketIdRef.current = socket.id || null;
      (window as any).socketId = socket.id;
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    return () => {
      socket.off('connect', handleConnect);
    };
  }, []);

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const turnServer = process.env.NEXT_PUBLIC_TURN_SERVER || '';
    const turnSecret = process.env.NEXT_PUBLIC_TURN_SECRET || '';

    const iceServers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];

    if (turnServer) {
      iceServers.push({
        urls: turnServer,
        username: 'ishan',
        credential: turnSecret,
      });
    }

    const pc = new RTCPeerConnection({ iceServers });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev: RemoteStreams) => {
          const playerData = playersRef.current[peerId];
          return {
            ...prev,
            [peerId]: {
              stream: event.streams[0],
              username: playerData?.username || 'Unknown',
              position: playerData?.position || { x: 0, y: 0 }
            }
          };
        });
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice', {
          to: peerId,
          candidate: event.candidate,
          mapUID
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setRemoteStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[peerId];
          return newStreams;
        });
      }
    };

    peerConnectionsRef.current[peerId] = pc;
    return pc;
  }, [mapUID, setRemoteStreams]);

  // Initialize socket connection and join room
  useEffect(() => {
    const handleConnect = () => {
      if (!hasJoinedRef.current) {
        socket.emit("join", { mapUID, user: { username, avatar: JSON.parse(localStorage.getItem("user") || "{}").avatar || "preset_1" } });
        hasJoinedRef.current = true;
      }
    };

    const handlePlayersUpdate = (serverPlayers: PlayersMap) => {
      setPlayers(serverPlayers);

      const currentSocketId = socketIdRef.current;
      if (!currentSocketId) return;

      setRemoteStreams(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          if (serverPlayers[id]) {
            updated[id] = {
              ...updated[id],
              username: serverPlayers[id].username,
              position: serverPlayers[id].position
            };
          }
        });
        return updated;
      });

      Object.keys(serverPlayers).forEach((playerId) => {
        if (playerId !== currentSocketId && !peerConnectionsRef.current[playerId]) {
          const pc = createPeerConnection(playerId);

          // Create offer regardless of local stream (receive-only is fine)
          setTimeout(async () => {
            try {
              const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
              });
              await pc.setLocalDescription(offer);
              socket.emit('webrtc-offer', {
                to: playerId,
                offer: pc.localDescription,
                mapUID
              });
            } catch (err) {
              console.error('Error creating offer:', err);
            }
          }, 200);
        }
      });

      Object.keys(peerConnectionsRef.current).forEach((playerId) => {
        if (!serverPlayers[playerId]) {
          peerConnectionsRef.current[playerId].close();
          delete peerConnectionsRef.current[playerId];
          delete iceCandidateBufferRef.current[playerId];
          setRemoteStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[playerId];
            return newStreams;
          });
        }
      });
    };

    const handlePlayersLeft = (socketId: string) => {
      if (peerConnectionsRef.current[socketId]) {
        peerConnectionsRef.current[socketId].close();
        delete peerConnectionsRef.current[socketId];
      }
      delete iceCandidateBufferRef.current[socketId];
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[socketId];
        return newStreams;
      });
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("playersLeft", handlePlayersLeft);

    // Chat message handler
    const handleChatMessage = ({ username: senderUsername, message }: { username: string; message: string }) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory(prev => [...prev, { username: senderUsername, message, timestamp }]);
    };

    socket.on("chatMsg", handleChatMessage);
    return () => {
      socket.off('connect', handleConnect);
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("playersLeft", handlePlayersLeft);
      socket.off("chatMsg", handleChatMessage);
    };
  }, [mapUID, username, setRemoteStreams, createPeerConnection]);

  // WebRTC signaling handlers
  useEffect(() => {
    const handleWebRTCOffer = async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      let pc = peerConnectionsRef.current[from];
      if (!pc) {
        pc = createPeerConnection(from);
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        // Flush buffered ICE candidates
        const buffered = iceCandidateBufferRef.current[from] || [];
        for (const c of buffered) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* skip invalid */ }
        }
        delete iceCandidateBufferRef.current[from];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc-answer", {
          to: from,
          answer: pc.localDescription,
          mapUID
        });
      } catch (err) {
        console.error(err)
      }
    };

    const handleWebRTCAnswer = async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc && pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          // Flush buffered ICE candidates
          const buffered = iceCandidateBufferRef.current[from] || [];
          for (const c of buffered) {
            try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* skip invalid */ }
          }
          delete iceCandidateBufferRef.current[from];
        } catch (err) {
          console.error(err)
        }
      }
    };

    const handleWebRTCIce = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc) {
        if (pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error(err)
          }
        } else {
          // Buffer candidates until remoteDescription is set
          if (!iceCandidateBufferRef.current[from]) {
            iceCandidateBufferRef.current[from] = [];
          }
          iceCandidateBufferRef.current[from].push(candidate);
        }
      }
    };

    socket.on("webrtc-offer", handleWebRTCOffer);
    socket.on("webrtc-answer", handleWebRTCAnswer);
    socket.on("webrtc-ice", handleWebRTCIce);

    return () => {
      socket.off("webrtc-offer", handleWebRTCOffer);
      socket.off("webrtc-answer", handleWebRTCAnswer);
      socket.off("webrtc-ice", handleWebRTCIce);
    };
  }, [createPeerConnection]);

  // Handle local stream changes — use replaceTrack for reliability
  useEffect(() => {
    if (!localStream) return;

    let needsRenegotiation = false;

    Object.values(peerConnectionsRef.current).forEach(pc => {
      const senders = pc.getSenders();

      localStream.getTracks().forEach(track => {
        const existingSender = senders.find(s => s.track?.kind === track.kind);
        if (existingSender) {
          // Replace track on existing sender — no renegotiation needed
          existingSender.replaceTrack(track).catch(err => console.error('replaceTrack error:', err));
        } else {
          // No sender for this track kind yet — add it (needs renegotiation)
          pc.addTrack(track, localStream);
          needsRenegotiation = true;
        }
      });
    });

    // Only renegotiate if we added new tracks (not just replaced)
    if (needsRenegotiation) {
      Object.entries(peerConnectionsRef.current).forEach(([playerId, pc]) => {
        if (pc.signalingState === 'stable') {
          setTimeout(async () => {
            try {
              const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
              });
              await pc.setLocalDescription(offer);
              socket.emit('webrtc-offer', {
                to: playerId,
                offer: pc.localDescription,
                mapUID
              });
            } catch (err) {
              console.error('Renegotiation error:', err);
            }
          }, 100);
        }
      });
    }
  }, [localStream, mapUID]);

  // Handle position updates
  useEffect(() => {
    socket.emit("move", { mapUID, position });

    setRemoteStreams(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        if (playersRef.current[id]) {
          updated[id] = {
            ...updated[id],
            position: playersRef.current[id].position
          };
        }
      });
      return updated;
    });
  }, [position, mapUID, setRemoteStreams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(peerConnectionsRef.current).forEach(pc => {
        pc.close();
      });
      peerConnectionsRef.current = {};
      if (hasJoinedRef.current) {
        hasJoinedRef.current = false;
      }
    };
  }, []);

  const sendChatMessage = (message: string) => {
    socket.emit("chat", { mapUID, message });
  };

  return { players, chatHistory, sendChatMessage };
};