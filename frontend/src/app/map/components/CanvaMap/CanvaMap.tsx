"use client";

import { useRef, useState, useEffect } from "react";
import { usePlayerMovement } from "./usePlayerMovement";
import { useSocket } from "./useSocket";
import { useCanvasDrawing } from "./useCanvasDrawing";
import { VideoChat } from "../VideoChat/VideoChat";
import toast from "react-hot-toast";
import { PlayerVideoOverlay } from "./PlayerVideoOverlay";

interface AvatarCanvasProps {
  width: number;
  height: number;
  mapUID: number;
  username: string;
}

const CanvaMap = ({ username, mapUID, width = 1800, height = 1000 }: AvatarCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { position, camera, viewPortSize } = usePlayerMovement({ width, height });
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{[key:string]: {
    stream: MediaStream;
    username: string;
    position: {
      x: number;
      y: number;
    }
  }}>({});

  const { players } = useSocket({
    mapUID,
    username,
    position,
    localStream,
    setRemoteStreams
  });

  useCanvasDrawing({
    canvasRef,
    position,
    camera,
    viewPortSize,
    players,
    width,
    height,
    remoteStreams
  });

  // Handle media stream initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const initMedia = async () => {
      try {
        // Stop existing stream
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
        }

        if (isCameraOn || !isMuted || isSharingScreen) {
          if (isSharingScreen) {
            try {
              const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
              });
              
              if (!isMuted) {
                try {
                  const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                  });
                  const audioTrack = audioStream.getAudioTracks()[0];
                  if (audioTrack) {
                    screenStream.addTrack(audioTrack);
                  }
                } catch (audioErr) {
                  // Could not add audio
                }
              }
              
              stream = screenStream;
              
              screenStream.getVideoTracks()[0].onended = () => {
                setIsSharingScreen(false);
              };
            } catch (err) {
              setIsSharingScreen(false);
              toast.error("Failed to start screen sharing");
              return;
            }
          } else {
            stream = await navigator.mediaDevices.getUserMedia({
              video: isCameraOn,
              audio: !isMuted
            });
          }
          
          setLocalStream(stream);
        }
      } catch (err) {
        setIsCameraOn(false);
        setIsSharingScreen(false);
        toast.error("Failed to access camera/microphone");
      }
    };

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, isMuted, isSharingScreen]);

  const handleToggleScreenShare = () => {
    if (isSharingScreen) {
      setIsSharingScreen(false);
    } else {
      setIsCameraOn(false);
      setIsSharingScreen(true);
    }
  };

  return (
    <div className="py-2 max-h-screen overflow-hidden flex flex-col items-center gap-4 relative">
      <canvas
        ref={canvasRef}
        width={viewPortSize.width}
        height={viewPortSize.height}
        className="border-4 border-indigo-500 rounded shadow-lg bg-white"
      />
      
      {/* Remote player video overlays */}
      {Object.entries(remoteStreams).map(([id, {stream, username, position}]) => (
        <PlayerVideoOverlay
          key={id}
          stream={stream}
          username={username}
          position={position}
          camera={camera}
          viewPortSize={viewPortSize}
        />
      ))}

      {/* Video chat controls and local video */}
      <VideoChat
        localStream={localStream}
        isMuted={isMuted}
        isCameraOn={isCameraOn}
        isSharingScreen={isSharingScreen}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleCamera={() => {
          if (isSharingScreen) {
            setIsSharingScreen(false);
          }
          setIsCameraOn(!isCameraOn);
        }}
        onToggleScreenShare={handleToggleScreenShare}
        remoteStreams={remoteStreams}
      />

      {/* Debug info */}
      <div className="fixed top-4 left-4 bg-black/90 text-white p-3 rounded-lg text-xs z-50 font-mono">
        <div className="text-green-400 font-bold mb-2">🎮 Debug</div>
        <div>👥 Players: {Object.keys(players).length}</div>
        <div>📹 Remote Videos: {Object.keys(remoteStreams).length}</div>
        <div>🎥 Local Stream: {localStream ? '✅' : '❌'}</div>
        <div>🔊 Audio: {!isMuted ? '✅' : '❌'}</div>
        <div>📹 Camera: {isCameraOn ? '✅' : '❌'}</div>
        <div>🖥️ Screen: {isSharingScreen ? '✅' : '❌'}</div>
        {Object.entries(remoteStreams).map(([id, data]) => (
          <div key={id} className="text-yellow-300">
            📺 {data.username}: {data.stream.getTracks().length} tracks
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvaMap;