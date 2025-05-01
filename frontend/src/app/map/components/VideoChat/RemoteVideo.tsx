// components/VideoChat/RemoteVideo.tsx
"use client";

import { useRef } from "react";

export const RemoteVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={videoRef}
      autoPlay
      className="w-32 h-24 rounded border border-gray-300"
    />
  );
};