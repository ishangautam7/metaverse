import { useEffect, useRef, useState } from "react";
import { MediaControls } from "./MediaControls";
import { useRouter } from "next/navigation";
import { socket } from "../../lib/socket";

interface PeerConnection {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

export const VideoChat = ({ mapUID }: { mapUID: string }) => {
  const router = useRouter();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peers, setPeers] = useState<Record<string, PeerConnection>>({});

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
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeMedia();
    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice", handleIceCandidate);

    return () => {
      socket.off("playersUpdate");
      socket.off("playerLeft");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
      Object.values(peers).forEach(({ pc }) => pc.close());
    };
  }, []);

  const handlePlayersUpdate = (users: Record<string, any>) => {
    Object.keys(users).forEach(userId => {
      if (userId !== socket.id && !peers[userId]) {
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
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice", {
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

      socket.emit("webrtc-offer", {
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
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice", {
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

      socket.emit("webrtc-answer", {
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
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

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
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }

        Object.values(peers).forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(null);
          }
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

        if (localStreamRef.current) {
          localStreamRef.current.addTrack(audioTrack);
        }

        Object.values(peers).forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === "audio");
          if (sender) {
            sender.replaceTrack(audioTrack);
          } else if (localStreamRef.current) {
            pc.addTrack(audioTrack, localStreamRef.current);
          }
        });
      } else {
        localStreamRef.current?.getAudioTracks().forEach(track => {
          track.stop();
          localStreamRef.current?.removeTrack(track);
        });

        Object.values(peers).forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === "audio");
          if (sender) {
            sender.replaceTrack(null);
          }
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
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        screenTrack.onended = () => {
          toggleScreenShare();
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
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      setIsScreenSharing(false);
      screenTrackRef.current = null;
    }
  };

  const handleLeave = () => {
    router.push("/dashboard");
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    Object.values(peers).forEach(({ pc }) => pc.close());
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Object.entries(peers).map(([userId, { stream }]) => (
          <div key={userId} className="relative">
            <video
              ref={el => {
                if (el) {
                  remoteVideosRef.current[userId] = el;
                  el.srcObject = stream;
                }
              }}
              autoPlay
              playsInline
              className="w-full h-48 rounded-lg bg-black/50 object-cover"
            />
          </div>
        ))}
      </div>

      <div className="fixed top-4 right-4 z-50">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-48 h-36 rounded-lg bg-black/50 border-2 border-blue-500"
        />
      </div>

      <MediaControls
        isCameraOn={isCameraOn}
        setIsCameraOn={toggleCamera}
        isMicOn={isMicOn}
        setIsMicOn={toggleMic}
        isScreenSharing={isScreenSharing}
        toggleScreenShare={toggleScreenShare}
        handleLeave={handleLeave}
      />
    </div>
  );
};