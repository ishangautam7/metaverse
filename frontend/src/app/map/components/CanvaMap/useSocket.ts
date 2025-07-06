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
    return () => {socket.off('connect', handleConnect)};
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

    // Add local stream tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    // Handle incoming remote stream
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

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice', {
          to: peerId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
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

      // Update positions in remote streams immediately
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

      // Create peer connections for new players (excluding self)
      Object.keys(serverPlayers).forEach((playerId) => {
        if (playerId !== currentSocketId && !peerConnectionsRef.current[playerId]) {
          const pc = createPeerConnection(playerId);
          
          // If we have a local stream, create an offer after a short delay
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
                // Error creating offer
              }
            }, 200);
          }
        }
      });

      // Clean up connections for players who left
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

    return () => {
      socket.off('connect', handleConnect);
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("playersLeft", handlePlayersLeft);
    };
  }, [mapUID, username]);

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
        // Error handling offer
      }
    };

    const handleWebRTCAnswer = async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc && pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          // Error handling answer
        }
      }
    };

    const handleWebRTCIce = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          // Error handling ICE candidate
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
  }, []);

  // Handle local stream changes
  useEffect(() => {
    if (!localStream) return;

    // Update all existing peer connections with new stream
    Object.values(peerConnectionsRef.current).forEach(pc => {
      // Remove old tracks
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          pc.removeTrack(sender);
        }
      });

      // Add new tracks
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    });

    // Create new offers for existing stable connections
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
            // Error creating renegotiation offer
          }
        }, 100);
      }
    });
  }, [localStream]);

  // Handle position updates - this is key for moving videos with avatars
  useEffect(() => {
    socket.emit("move", { mapUID, position });
    
    // Update positions in remote streams when players move
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
  }, [position, mapUID]);

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

  return { players };
};