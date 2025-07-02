import { useEffect, useRef } from "react";

interface PlayerVideoOverlayProps {
  stream: MediaStream | null;
  position: { x: number; y: number };
  camera: { x: number; y: number };
  viewPortSize: { width: number; height: number };
  username: string;
}

export const PlayerVideoOverlay = ({ stream, position, camera, viewPortSize, username }: PlayerVideoOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
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
      className="absolute z-50 pointer-events-none transition-all duration-75 ease-linear"
      style={{
        left: `${videoX}px`,
        top: `${videoY}px`,
        width: `${videoSize}px`,
        height: `${videoSize}px`,
        transform: 'translateZ(0)', // Force hardware acceleration
      }}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full rounded-lg shadow-lg bg-black object-cover ${
            isScreenShare 
              ? 'border-2 border-blue-400' 
              : 'border-2 border-purple-400'
          }`}
        />
      ) : (
        // Show audio-only indicator when only audio is active
        <div className="w-full h-full rounded-lg shadow-lg bg-gray-800 border-2 border-green-400 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-2xl mb-1">🎤</div>
            <div className="text-xs">Audio</div>
          </div>
        </div>
      )}
      
      {/* Username label */}
      <div className={`absolute -bottom-6 left-0 right-0 text-white text-center py-1 text-xs truncate rounded ${
        isScreenShare 
          ? 'bg-blue-600 bg-opacity-90' 
          : hasVideo 
            ? 'bg-purple-600 bg-opacity-90'
            : 'bg-green-600 bg-opacity-90'
      }`}>
        {username} {isScreenShare ? "(Screen)" : !hasVideo ? "(Audio)" : ""}
      </div>
      
      {/* Screen share indicator */}
      {isScreenShare && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-sm"></div>
        </div>
      )}

      {/* Live indicator - different colors for different states */}
      <div className={`absolute top-1 left-1 w-2 h-2 rounded-full opacity-75 animate-pulse ${
        hasVideo ? 'bg-green-500' : 'bg-yellow-500'
      }`}></div>
    </div>
  );
};