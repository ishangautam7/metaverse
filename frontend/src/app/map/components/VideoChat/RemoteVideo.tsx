"use client";

import { video } from "framer-motion/client";
import { useRef, useEffect } from "react";

interface RemoteVideoProps {
  stream: MediaStream | null;
  username: string;
  position: {x:number; y:number}
}

export const RemoteVideo = ({stream, username, position}:RemoteVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(()=>{
    if(videoRef.current && stream){
      videoRef.current.srcObject = stream;
    }
  }, [stream])

  return (
    <div className="absolute z-50" style={{
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: 'translate(-50%, 50%)'
    }}>
      <video ref={videoRef} autoPlay className="w-32 h-24 rounded-lg border-2 border-blue-500 shadow-md bg-black" ></video>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1" >{username}</div>
    </div>
  );
};