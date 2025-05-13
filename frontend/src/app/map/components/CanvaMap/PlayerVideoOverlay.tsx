import { useEffect, useRef } from "react";

interface PlayerVideoOverlayProps {
  stream: MediaStream | null;
  position: { x: number; y: number };
  camera: { x: number; y: number };
  viewPortSize: { width: number; height: number };
  username: string
}

export const PlayerVideoOverlay = ({ stream, position, camera, viewPortSize, username }: PlayerVideoOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSize = 120;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const drawX = position.x - camera.x;
  const drawY = position.y - camera.y;

  if (
    drawX + videoSize < 0 || drawX > viewPortSize.width ||
    drawY + videoSize < 0 || drawY > viewPortSize.height
  ) return null;

  return (
    <div
      className="absolute z-50"
      style={{
        left: `${drawX - videoSize/2 + 20}px`,
        top: `${drawY - videoSize - 10}px`,
        width: `${videoSize}px`,
        height: `${videoSize}px`
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full rounded-lg border-2 border-blue-500 shadow-md bg-black"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1 text-sm truncate">
        {username}
      </div>
    </div>
  );
};