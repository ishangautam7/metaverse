"use client"

import { useEffect, useRef, useState } from "react";
import { MediaControls } from "./MediaControls";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

type PeerConnection = {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
};

const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const VideoChat = ({ mapUID }: { mapUID: string }) => {
  const router = useRouter();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peers, setPeers] = useState<Record<string, PeerConnection>>({});

  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Record<string, HTMLVideoElement | null>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isCameraOn,
          audio: isMicOn,
        });

        localStreamRef.current = stream;
        updateLocalVideo(stream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeMedia();
    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Socket initialization and cleanup
  useEffect(() => {
    socketRef.current = io();
    setupSocketListeners();

    return () => {
      socketRef.current?.disconnect();
      Object.values(peers).forEach(({ pc }) => pc.close());
    };
  }, []);

  const updateLocalVideo = (stream: MediaStream | null) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.style.display = stream ? "block" : "none";
    }
  };

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    socketRef.current.on("playersUpdate", handlePlayersUpdate);
    socketRef.current.on("playerLeft", handlePlayerLeft);
    socketRef.current.on("webrtc-offer", handleOffer);
    socketRef.current.on("webrtc-answer", handleAnswer);
    socketRef.current.on("webrtc-ice", handleIceCandidate);
  };

  const handlePlayersUpdate = (users: Record<string, any>) => {
    Object.keys(users).forEach(userId => {
      if (userId !== socketRef.current?.id && !peers[userId]) {
        createPeerConnection(userId);
      }
    });
  };

  const handlePlayerLeft = (userId: string) => {
    if (peers[userId]) {
      peers[userId].pc.close();
      setPeers(prev => {
        const newPeers = { ...prev };
        delete newPeers[userId];
        return newPeers;
      });
    }
  };

  const createPeerConnection = async (userId: string) => {
    const pc = new RTCPeerConnection(iceServers);
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (track.kind === "video" && !isCameraOn) return;
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("webrtc-ice", {
          mapUID,
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setPeers(prev => ({
        ...prev,
        [userId]: { pc, stream: event.streams[0] },
      }));
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit("webrtc-offer", {
        mapUID,
        to: userId,
        offer,
      });

      setPeers(prev => ({ ...prev, [userId]: { pc, stream: null } }));
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleOffer = async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
    const pc = new RTCPeerConnection(iceServers);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (track.kind === "video" && !isCameraOn) return;
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("webrtc-ice", {
          mapUID,
          to: from,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setPeers(prev => ({
        ...prev,
        [from]: { pc, stream: event.streams[0] },
      }));
    };

    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current?.emit("webrtc-answer", {
        mapUID,
        to: from,
        answer,
      });

      setPeers(prev => ({ ...prev, [from]: { pc, stream: null } }));
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
    const pc = peers[from]?.pc;
    if (pc) {
      try {
        await pc.setRemoteDescription(answer);
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  };

  const handleIceCandidate = ({ from, candidate }: { from: string; candidate: RTCIceCandidate }) => {
    const pc = peers[from]?.pc;
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const toggleCamera = async () => {
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);

    try {
      if (newCameraState) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isMicOn,
        });

        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = stream;
        updateLocalVideo(stream);

        Object.values(peers).forEach(({ pc }) => {
          const videoTrack = stream.getVideoTracks()[0];
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(videoTrack);
          } else {
            pc.addTrack(videoTrack, stream);
          }
        });
      } else {
        localStreamRef.current?.getVideoTracks().forEach(track => track.stop());
        updateLocalVideo(null);

        Object.values(peers).forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          sender?.replaceTrack(null);
        });
      }
    } catch (error) {
      console.error("Error toggling camera:", error);
      setIsCameraOn(!newCameraState);
    }
  };

  const toggleMic = async () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);

    try {
      if (newMicState) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const audioTrack = stream.getAudioTracks()[0];
        localStreamRef.current?.getAudioTracks().forEach(track => track.stop());
        
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(audioTrack);
        }

        Object.values(peers).forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === "audio");
          if (sender) {
            sender.replaceTrack(audioTrack);
          } else {
            pc.addTrack(audioTrack, localStreamRef.current!);
          }
        });
      } else {
        localStreamRef.current?.getAudioTracks().forEach(track => track.stop());
        
        Object.values(peers).forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === "audio");
          sender?.replaceTrack(null);
        });
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
      setIsMicOn(!newMicState);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        Object.values(peers).forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          sender?.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          toggleScreenShare();
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
        screenTrackRef.current = screenTrack;
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    } else {
      screenTrackRef.current?.stop();
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];

      Object.values(peers).forEach(({ pc }) => {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (videoTrack) {
          sender?.replaceTrack(videoTrack);
        }
      });

      setIsScreenSharing(false);
    }
  };

  const handleLeave = () => {
    router.push("/");
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    socketRef.current?.disconnect();
  };

  return (
    <div className="relative h-screen w-full bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-20">
        {Object.entries(peers).map(([userId, { stream }]) => (
          <video
            key={userId}
            ref={el => {
              if (el) {
                remoteVideosRef.current[userId] = el;
                el.srcObject = stream;
              }
            }}
            autoPlay
            playsInline
            className="w-full h-48 rounded-lg bg-black"
          />
        ))}
      </div>

      <div className="fixed top-4 z-10 lg:right-6">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-50 h-40 rounded-lg bg-black border-2 border-blue-500 shadow-xl"
          style={{ display: isCameraOn ? 'block' : 'none' }}
        />
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <MediaControls
          isCameraOn={isCameraOn}
          setIsCameraOn={setIsCameraOn}
          isMicOn={isMicOn}
          setIsMicOn={setIsMicOn}
          isScreenSharing={isScreenSharing}
          toggleScreenShare={toggleScreenShare}
          handleLeave={handleLeave}
        />
      </div>
    </div>
  );
};