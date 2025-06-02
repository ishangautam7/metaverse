import { useEffect, useState, useRef } from 'react';
import { Peer } from 'peerjs';
import { socket } from '../../lib/socket';

interface UsePeerVideoProps {
  mapUID: number;
  username: string;
}

export const usePeerVideo = ({ mapUID, username }: UsePeerVideoProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerStreams, setPeerStreams] = useState<Record<string, MediaStream>>({});
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const myPeerRef = useRef<Peer | null>(null);
  const peersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const initializePeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);

        const peer = new Peer();
        myPeerRef.current = peer;

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
          peersRef.current[socketId] = call;
        });

        socket.on('user-disconnected', (socketId) => {
          if (peersRef.current[socketId]) {
            peersRef.current[socketId].close();
          }
          setPeerStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[socketId];
            return newStreams;
          });
          delete peersRef.current[socketId];
        });
      } catch (error) {
        console.error('Failed to get media devices:', error);
      }
    };

    initializePeer();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      myPeerRef.current?.destroy();
      Object.values(peersRef.current).forEach(peer => peer.close());
    };
  }, [mapUID, username]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return {
    localStream,
    peerStreams,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio
  };
};