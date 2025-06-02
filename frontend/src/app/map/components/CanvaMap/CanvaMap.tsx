"use client";

import { useRef, useState } from "react";
import { usePlayerMovement } from "./usePlayerMovement";
import { useSocket } from "./useSocket";
import { useCanvasDrawing } from "./useCanvasDrawing";
import { ChatOverlay } from "./ChatOverlay";
import { PlayerVideoOverlay } from "./PlayerVideoOverlay";
import { usePeerVideo } from "./usePeerVideo";
import { VideoControls } from "./VideoControls";

interface AvatarCanvasProps {
  width: number;
  height: number;
  mapUID: number;
  username: string;
}

const CanvaMap = ({ username, mapUID, width = 1800, height = 1000 }: AvatarCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { position, camera, viewPortSize } = usePlayerMovement({ width, height });
  const { players, chatHistory, sendChatMessage } = useSocket({ mapUID, username, position });
  const {
    localStream,
    peerStreams,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio
  } = usePeerVideo({ mapUID, username });

  useCanvasDrawing({
    canvasRef,
    position,
    camera,
    viewPortSize,
    players,
    width,
    height
  });

  return (
    <div className="py-2 max-h-screen overflow-hidden flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={viewPortSize.width}
          height={viewPortSize.height}
          className="border-4 border-indigo-500 rounded shadow-lg bg-white"
        />
        
        {Object.entries(players).map(([socketId, player]) => (
          peerStreams[socketId] && (
            <PlayerVideoOverlay
              key={socketId}
              stream={peerStreams[socketId]}
              position={player.position}
              camera={camera}
              viewPortSize={viewPortSize}
              username={player.username}
            />
          )
        ))}

        {localStream && (
          <div className="fixed top-4 right-4 w-48 h-36">
            <video
              ref={(video) => {
                if (video) {
                  video.srcObject = localStream;
                  video.muted = true;
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full rounded-lg border-2 border-blue-500"
            />
          </div>
        )}
      </div>

      <VideoControls
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
      />

      <ChatOverlay onSendMessage={sendChatMessage} chatHistory={chatHistory} />
    </div>
  );
};

export default CanvaMap;