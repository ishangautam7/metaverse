import { useEffect, useRef, useState } from "react";

interface PlayerVideoOverlayProps {
  stream: MediaStream | null;
  position: { x: number; y: number };
  camera: { x: number; y: number };
  viewPortSize: { width: number; height: number };
  username: string;
}

export const PlayerVideoOverlay = ({ stream, position, camera, viewPortSize, username }: PlayerVideoOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);
  const videoSize = 80;
  const avatarSize = 40;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Video play failed - silently handle
      });
    }

    return () => {
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream, username]);

  useEffect(() => {
    if (!videoRef.current) return;

    // The local player's true coordinate is roughly camera.x + viewPortSize.width / 2
    // camera.x is the top-left offset of the viewport
    const localX = camera.x + viewPortSize.width / 2;
    const localY = camera.y + viewPortSize.height / 2;

    const dx = localX - position.x;
    const dy = localY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Max hearing distance = 600px. Falloff from 100px.
    const maxVolumeDist = 100;
    const dropoffDist = 600;

    let volume = 1;
    if (distance > dropoffDist) {
      volume = 0;
    } else if (distance > maxVolumeDist) {
      volume = 1 - (distance - maxVolumeDist) / (dropoffDist - maxVolumeDist);
    }

    videoRef.current.volume = Math.max(0, Math.min(1, volume));
  }, [camera.x, camera.y, position.x, position.y, viewPortSize.width, viewPortSize.height]);

  // Don't render if no stream or stream has no active tracks
  if (!stream) return null;

  const hasActiveVideo = stream.getVideoTracks().some(track => track.enabled && track.readyState === 'live');
  const hasActiveAudio = stream.getAudioTracks().some(track => track.enabled && track.readyState === 'live');

  // Hide component if no active video or audio tracks
  if (!hasActiveVideo && !hasActiveAudio) return null;

  // Calculate video position relative to camera (same as avatar positioning)
  const drawX = position.x - camera.x;
  const drawY = position.y - camera.y;

  // Position video above the avatar
  const videoX = drawX + (avatarSize / 2) - (videoSize / 2);
  const videoY = drawY - videoSize - 10; // 10px gap above avatar

  // Only render if video would be visible in viewport (with some buffer)
  if (
    videoX + videoSize < -50 || videoX > viewPortSize.width + 50 ||
    videoY + videoSize < -50 || videoY > viewPortSize.height + 50
  ) return null;

  const videoTrack = stream.getVideoTracks()[0];
  const isScreenShare = videoTrack && videoTrack.getSettings().displaySurface !== undefined;
  const hasVideo = hasActiveVideo;

  return (
    <div
      className={`absolute z-50 transition-all duration-75 ease-linear ${hasVideo ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{
        left: `${videoX}px`,
        top: `${videoY}px`,
        width: `${videoSize}px`,
        height: `${videoSize}px`,
        transform: 'translateZ(0)', // Force hardware acceleration
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`${hasVideo ? 'block' : 'hidden'} w-full h-full rounded-lg shadow-lg bg-black object-cover ${isScreenShare
            ? 'border-2 border-blue-400'
            : 'border-2 border-purple-400'
          }`}
      />
      
      {/* Hide the visual overlay completely if there's no video as requested */}
      {hasVideo && (
        <div className={`absolute -bottom-6 left-0 right-0 text-white text-center py-1 text-xs truncate rounded ${isScreenShare ? 'bg-blue-600 bg-opacity-90' : 'bg-purple-600 bg-opacity-90'}`}>
          {username} {isScreenShare && "(Screen)"}
        </div>
      )}

      {/* Screen share indicator */}
      {isScreenShare && hasVideo && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-sm"></div>
        </div>
      )}

      {/* Live indicator - different colors for different states */}
      {hasVideo && (
         <div className="absolute top-1 left-1 w-2 h-2 rounded-full opacity-75 animate-pulse bg-green-500"></div>
      )}

      {/* Fullscreen control */}
      {hasVideo && showControls && (
        <button 
          className="absolute inset-0 m-auto w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
          onClick={() => {
            if (videoRef.current) {
              if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
              }
            }
          }}
          title="Fullscreen"
        >
          ⤢
        </button>
      )}
    </div>
  );
};