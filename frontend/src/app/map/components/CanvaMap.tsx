"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface AvatarCanvasProps {
  width: number;
  height: number;
  mapUID: number;
}

interface Player {
  username: string;
  position: { x: number; y: number };
}

interface PlayersMap {
  [socketId: string]: Player;
}

const socket: Socket = io('http://localhost:4000'); // Backend server URL

const CanvaMap = ({ mapUID, width = 1800, height = 1000 }: AvatarCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState({ x: width / 2, y: height / 2 });
  const [avatarSize] = useState(40);
  const [bgColor] = useState("#f0f0f0");
  const [obstacles] = useState([
    { x: 400, y: 300, w: 100, h: 100 },
    { x: 800, y: 600, w: 150, h: 100 }
  ]);
  const [players, setPlayers] = useState<PlayersMap>({});

  const username = "Player" + Math.floor(Math.random() * 1000);

  // Handle socket events
  useEffect(() => {
    socket.emit("join", { mapUID, user: { username } });

    socket.on("playersUpdate", (players: PlayersMap) => {
      setPlayers(players);
    });

    return () => {
      socket.off('playersUpdate');
    };
  }, []);

  // Emit own movement
  useEffect(() => {
    socket.emit("move", { mapUID, position });
  }, [position]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveAmount = 10;
      const newPosition = { ...position };

      switch (e.key.toLowerCase()) {
        case 'w':
          newPosition.y = Math.max(0, position.y - moveAmount);
          break;
        case 'a':
          newPosition.x = Math.max(0, position.x - moveAmount);
          break;
        case 's':
          newPosition.y = Math.min(height - avatarSize, position.y + moveAmount);
          break;
        case 'd':
          newPosition.x = Math.min(width - avatarSize, position.x + moveAmount);
          break;
        default:
          return;
      }

      setPosition(newPosition);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, width, height, avatarSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw obstacles
    ctx.fillStyle = '#888';
    obstacles.forEach(({ x, y, w, h }) => {
      ctx.fillRect(x, y, w, h);
    });

    // Draw grid
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw all players
    Object.entries(players).forEach(([id, player]) => {
      const isSelf = player.position.x === position.x && player.position.y === position.y;
      ctx.fillStyle = isSelf ? '#4CAF50' : '#2196F3';
      ctx.beginPath();
      ctx.arc(player.position.x + avatarSize / 2, player.position.y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(player.position.x + avatarSize / 3, player.position.y + avatarSize / 3, 5, 0, Math.PI * 2);
      ctx.arc(player.position.x + avatarSize * 2 / 3, player.position.y + avatarSize / 3, 5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.position.x + avatarSize / 2, player.position.y + avatarSize / 2, 10, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Username
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.fillText(player.username, player.position.x, player.position.y - 10);
    });
  }, [players, position, width, height, avatarSize, bgColor, obstacles]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-4 border-indigo-500 rounded shadow-lg bg-white"
      />
      <p className="text-gray-600">Use WASD keys to move the avatar</p>
    </div>
  );
};

export default CanvaMap;
