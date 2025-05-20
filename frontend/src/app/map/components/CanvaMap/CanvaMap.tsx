"use client";

import { useRef, useState, useEffect } from "react";
import { usePlayerMovement } from "./usePlayerMovement";
import { useSocket } from "./useSocket";
import { useCanvasDrawing } from "./useCanvasDrawing";
import { ChatOverlay } from "./ChatOverlay";
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
  const { players, chatHistory, sendChatMessage } = useSocket({ mapUID, username, position });

  useCanvasDrawing({
    canvasRef,
    position,
    camera,
    viewPortSize,
    players,
    width,
    height
  });
  // console.log(players)
  return (
    <div className="py-2 max-h-screen overflow-hidden flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={viewPortSize.width}
          height={viewPortSize.height}
          className="border-4 border-indigo-500 rounded shadow-lg bg-white"
        />
      </div>

      <ChatOverlay onSendMessage={sendChatMessage} chatHistory={chatHistory} />
    </div>
  );
};

export default CanvaMap;