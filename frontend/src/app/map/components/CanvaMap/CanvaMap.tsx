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
  }}>({})
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

  useEffect(() => {
    let stream: MediaStream | null = null
    const initMedia = async () => {
      try {
        if(isCameraOn || !isMuted){
          stream = await navigator.mediaDevices.getUserMedia({
            video: isCameraOn,
            audio: !isMuted
          })
          setLocalStream(stream)
        }else{
          if(localStream){
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
          }
        }
      } catch (err) {
        console.error("Failed to access media devices", err);
        setIsCameraOn(false); 
      }
    };
    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, isMuted]);


  return (
    <div className="py-2 max-h-screen overflow-hidden flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={viewPortSize.width}
        height={viewPortSize.height}
        className="border-4 border-indigo-500 rounded shadow-lg bg-white"
      />
      
      {Object.entries(remoteStreams).map(([id, {stream,username, position}])=>(
        <PlayerVideoOverlay
          key={id}
          stream={stream}
          username = {username}
          position={position}
          camera={camera}
          viewPortSize={viewPortSize}
        />
      ))}

      <VideoChat
        localStream={localStream}
        isMuted={isMuted}
        isCameraOn={isCameraOn}
        isSharingScreen={isSharingScreen}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleCamera={() => setIsCameraOn(!isCameraOn)}
        onToggleScreenShare={() =>
          toast("Screen Sharing will be available soon")
          // setIsSharingScreen(!isSharingScreen)
        }
        remoteStreams={remoteStreams}
      />
    </div>
  );
};

export default CanvaMap;