import { useEffect, useState, useRef } from "react";
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
  const localStreamRef = useRef<MediaStream | null>(null);
  const hasJoinedRef = useRef(false);
  const socketIdRef = useRef<string | null>(null);
  const playersRef = useRef<PlayersMap>({});

  // Update refs when values change
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

  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ]
    });

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
          candidate: event.candidate
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
  };

  // Initialize socket connection and join room
  useEffect(() => {
    const handleConnect = () => {
      if (!hasJoinedRef.current) {
        socket.emit("join", { mapUID, user: { username } });
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
          
          if (localStreamRef.current) {
            setTimeout(async () => {
              try {
                const offer = await pc.createOffer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: true
                });
                await pc.setLocalDescription(offer);
                socket.emit('webrtc-offer', {
                  to: playerId,
                  offer: pc.localDescription
                });
              } catch (err) {
                console.error(err)
              }
            }, 200);
          }
        }
      });

      Object.keys(peerConnectionsRef.current).forEach((playerId) => {
        if (!serverPlayers[playerId]) {
          peerConnectionsRef.current[playerId].close();
          delete peerConnectionsRef.current[playerId];
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
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc-answer", {
          to: from,
          answer: pc.localDescription
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
        } catch (err) {
          console.error(err)
        }
      }
    };

    const handleWebRTCIce = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error(err)
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

  // Handle local stream changes
  useEffect(() => {
    if (!localStream) return;

    Object.values(peerConnectionsRef.current).forEach(pc => {
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          pc.removeTrack(sender);
        }
      });

      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    });

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
              offer: pc.localDescription
            });
          } catch (err) {
            console.error(err)
          }
        }, 100);
      }
    });
  }, [localStream]);

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