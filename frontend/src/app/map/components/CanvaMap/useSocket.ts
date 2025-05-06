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
  const [peerConnections, setPeerConnections] = useState<{ [id: string]: RTCPeerConnection }>({});
  const playersRef = useRef(players)

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const createPeerConnection = (id: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ]
    });

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    pc.ontrack = (event) => {
      console.log('ontrack fired', event.streams);
      let stream = event.streams && event.streams[0];
      if (stream) {
        setRemoteStreams((prev: RemoteStreams) => ({
          ...prev,
          [id]: {
            stream,
            username: playersRef.current[id]?.username || 'Unknown',
            position: playersRef.current[id]?.position || { x: 0, y: 0 }
          }
        }));
      }
      // if (event.streams && event.streams.length > 0) {
        // setRemoteStreams((prev: RemoteStreams) => ({
        //   ...prev,
        //   [id]: {
        //     stream: event.streams[0],
        //     username: playersRef.current[id]?.username || 'Unknown',
        //     position: playersRef.current[id]?.position || { x: 0, y: 0 }
        //   }
      //   }));
      //   console.log("Setting remote stream for", id);
      // }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice', {
          to: id,
          candidate: event.candidate
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state for", id, ":", pc.iceConnectionState);
    };
    
    return pc;
  };

  // First useEffect - handle players update and create connections
  useEffect(() => {
    socket.emit("join", { mapUID, user: { username } });

    socket.on("playersUpdate", (players: PlayersMap) => {
      setPlayers(players);
      
      // When we receive players update, check for new players
      Object.keys(players).forEach((playerId) => {
        if (playerId !== socket.id && !peerConnections[playerId]) {
          const pc = createPeerConnection(playerId);
          setPeerConnections(prev => ({ ...prev, [playerId]: pc }));
        
          if (pc.signalingState === 'stable') {
            pc.createOffer()
              .then(offer => pc.setLocalDescription(offer))
              .then(() => {
                socket.emit('webrtc-offer', {
                  to: playerId,
                  offer: pc.localDescription
                });
              })
              .catch(err => console.error('Error creating offer:', err));
          } else {
            console.warn("Not creating offer, signaling state is:", pc.signalingState);
          }
        }
        
      });
    });

    return () => {
      socket.off("playersUpdate");
    };
  }, [mapUID, username]);

useEffect(() => {
    if (!localStream) return;

    socket.on("webrtc-offer", async ({ from, offer }) => {
      const pc = peerConnections[from];
      if (!pc) return;
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc-answer", {
          to: from,
          answer: pc.localDescription
        });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socket.on("webrtc-answer", async ({ from, answer }) => {
      const pc = peerConnections[from];
      if (pc && pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      }
    });

    socket.on("webrtc-ice", async ({ from, candidate }) => {
      const pc = peerConnections[from];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error handling ICE candidate:', err);
        }
      }
    });

    return () => {
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
    };
  }, [localStream, peerConnections]);

  useEffect(() => {
    socket.emit("move", { mapUID, position });
  }, [position]);

  return { players };
};