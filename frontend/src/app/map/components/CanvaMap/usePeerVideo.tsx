import { useEffect, useState, useRef, useCallback } from 'react';
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
  const localStreamRef = useRef<MediaStream | null>(null);

  const handleStream = useCallback((socketId: string, stream: MediaStream) => {
    setPeerStreams(prev => ({
      ...prev,
      [socketId]: stream
    }));
  }, []);

  useEffect(() => {
    const initializePeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        setLocalStream(stream);
        localStreamRef.current = stream;

        const peer = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ]
          }
        });
        
        myPeerRef.current = peer;

        peer.on('open', (peerId) => {
          socket.emit('join-video', { mapUID, peerId, username });
        });

        peer.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            handleStream(call.peer, remoteStream);
          });

          call.on('error', (error) => {
            console.error('Peer call error:', error);
          });
        });

        socket.on('user-connected', ({ socketId, peerId }) => {
          if (localStreamRef.current) {
            const call = peer.call(peerId, localStreamRef.current);
            call.on('stream', (remoteStream) => {
              handleStream(socketId, remoteStream);
            });
            call.on('error', (error) => {
              console.error('Error calling peer:', error);
            });
            peersRef.current[socketId] = call;
          }
        });

        socket.on('user-disconnected', (socketId) => {
          if (peersRef.current[socketId]) {
            peersRef.current[socketId].close();
            delete peersRef.current[socketId];
            setPeerStreams(prev => {
              const newStreams = { ...prev };
              delete newStreams[socketId];
              return newStreams;
            });
          }
        });

      } catch (error) {
        console.error('Failed to get media devices:', error);
      }
    };

    initializePeer();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => {
        track.stop();
      });
      Object.values(peersRef.current).forEach(peer => {
        if (peer && peer.close) peer.close();
      });
      myPeerRef.current?.destroy();
      setPeerStreams({});
    };
  }, [mapUID, username, handleStream]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  return {
    localStream,
    peerStreams,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio
  };
};