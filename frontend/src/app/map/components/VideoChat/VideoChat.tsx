"use client"

import { useEffect, useRef, useState } from "react";
import { MediaControls } from "./MediaControls";
import { useRouter } from "next/navigation";

let peerConnection: RTCPeerConnection | null = null;

const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const VideoChat = () => {
  const router = useRouter();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    if (isCameraOn || isMicOn) {
      startMedia();
    } else {
      stopCamera();
    }
  }, [isCameraOn, isMicOn]);

  const startMedia = async () => {
    try {
      // Stop existing tracks if any
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
  
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isCameraOn,
        audio: isMicOn,
      });
  
      localStreamRef.current = stream;
  
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
  
      if (peerConnection) {
        peerConnection.close();
      }
      peerConnection = new RTCPeerConnection(iceServers);
  
      stream.getTracks().forEach((track) => {
        peerConnection?.addTrack(track, stream);
      });
    } catch (err) {
      console.error("Error accessing media:", err);
    }
  };

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop()); // Stop all tracks
    }
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        const sender = peerConnection?.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    setIsScreenSharing(false);

    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = peerConnection?.getSenders().find((s) => s.track?.kind === "video");
    if (videoTrack) {
      sender?.replaceTrack(videoTrack);
    }
  };

  const handleLeave = () => {
    stopCamera();
    stopScreenShare();
    router.push("/");
  };

  return (
    <>
      <MediaControls
        isCameraOn={isCameraOn}
        setIsCameraOn={setIsCameraOn}
        isMicOn={isMicOn}
        setIsMicOn={setIsMicOn}
        isScreenSharing={isScreenSharing}
        toggleScreenShare={toggleScreenShare}
        handleLeave={handleLeave}
      />

      {(isCameraOn || isScreenSharing) && (
        <div className="absolute top-2 my-2 lg:right-6">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-54 h-40 rounded" />
        </div>
      )}
    </>
  );
};
