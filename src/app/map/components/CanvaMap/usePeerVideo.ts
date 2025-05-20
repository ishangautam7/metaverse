import { useEffect, useState } from 'react';
import { Peer } from 'peerjs';
import { socket } from '../../lib/socket';

interface UsePeerVideoProps {
  mapUID: number;
  username: string;
}

export const usePeerVideo = ({ mapUID, username }: UsePeerVideoProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerStreams, setPeerStreams] = useState<Record<string, MediaStream>>({});
  const [myPeer, setMyPeer] = useState<Peer | null>(null);
  const [peers, setPeers] = useState<Record<string, any>>({});

  useEffect(() => {
    const initializePeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);

        const peer = new Peer();
        setMyPeer(peer);

        peer.on('open', (peerId) => {
          socket.emit('join-video', { mapUID, peerId, username });
        });

        peer.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            setPeerStreams(prev => ({
              ...prev,
              [call.peer]: remoteStream
            }));
          });
        });

        socket.on('user-connected', ({ socketId, peerId }) => {
          const call = peer.call(peerId, stream);
          call.on('stream', (remoteStream) => {
            setPeerStreams(prev => ({
              ...prev,
              [socketId]: remoteStream
            }));
          });
          setPeers(prev => ({
            ...prev,
            [socketId]: call
          }));
        });

        socket.on('user-disconnected', (socketId) => {
          if (peers[socketId]) {
            peers[socketId].close();
          }
          setPeerStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[socketId];
            return newStreams;
          });
          setPeers(prev => {
            const newPeers = { ...prev };
            delete newPeers[socketId];
            return newPeers;
          });
        });
      } catch (error) {
        console.error('Failed to get media devices:', error);
      }
    };

    initializePeer();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      myPeer?.destroy();
      Object.values(peers).forEach(peer => peer.close());
    };
  }, [mapUID, username]);

  return { localStream, peerStreams };
};