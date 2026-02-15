import { useEffect, useRef } from "react";
import { PlayersMap, Position, Camera, ViewPortSize, Obstacle, Room } from "./types";
import { AVATAR_PRESETS } from "../AvatarPicker/avatarPresets";

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  position: Position;
  camera: Camera;
  viewPortSize: ViewPortSize;
  players: PlayersMap;
  width: number;
  height: number;
  remoteStreams: { [key: string]: { stream: MediaStream; username: string; position: { x: number; y: number } } };
  rooms: Room[];
  obstacles: Obstacle[];
  currentAvatar: string;
}

// Cache loaded avatar images
const avatarImageCache: { [key: string]: HTMLImageElement } = {};

function getAvatarImage(avatarKey: string): HTMLImageElement | null {
  if (avatarImageCache[avatarKey]) return avatarImageCache[avatarKey];

  let src: string;
  if (avatarKey.startsWith("data:")) {
    src = avatarKey;
  } else if (AVATAR_PRESETS[avatarKey]) {
    src = AVATAR_PRESETS[avatarKey];
  } else {
    src = AVATAR_PRESETS["preset_1"];
  }

  const img = new Image();
  img.src = src;
  img.onload = () => {
    avatarImageCache[avatarKey] = img;
  };

  // Return null until loaded; next frame will have it
  if (img.complete) {
    avatarImageCache[avatarKey] = img;
    return img;
  }
  return null;
}

export const useCanvasDrawing = ({
  canvasRef,
  position,
  camera,
  viewPortSize,
  players,
  width,
  height,
  remoteStreams,
  rooms,
  obstacles,
  currentAvatar
}: UseCanvasDrawingProps) => {
  // Preload all avatar images
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!loadedRef.current) {
      Object.keys(AVATAR_PRESETS).forEach(k => getAvatarImage(k));
      loadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, viewPortSize.width, viewPortSize.height);

    drawGrid(ctx, camera, viewPortSize, width, height);
    drawRooms(ctx, camera, rooms);
    drawObstacles(ctx, camera, obstacles);
    drawPlayers(ctx, players, position, camera, viewPortSize, remoteStreams, currentAvatar);
  }, [players, position, camera, viewPortSize, width, height, remoteStreams, rooms, obstacles, currentAvatar]);
};

function drawGrid(ctx: CanvasRenderingContext2D, camera: Camera, viewPortSize: ViewPortSize, width: number, height: number) {
  ctx.strokeStyle = "#e5e5e5";
  ctx.lineWidth = 1;

  const gridSize = 40;
  const startX = Math.floor(camera.x / gridSize) * gridSize - camera.x;
  const startY = Math.floor(camera.y / gridSize) * gridSize - camera.y;

  for (let x = startX; x <= viewPortSize.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewPortSize.height);
    ctx.stroke();
  }
  for (let y = startY; y <= viewPortSize.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewPortSize.width, y);
    ctx.stroke();
  }

  const bx = -camera.x;
  const by = -camera.y;
  ctx.strokeStyle = "#d4d4d4";
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, width, height);
}

function drawRooms(ctx: CanvasRenderingContext2D, camera: Camera, rooms: Room[]) {
  rooms.forEach(room => {
    const dx = room.x - camera.x;
    const dy = room.y - camera.y;

    ctx.fillStyle = room.color || "#f0f0f0";
    ctx.globalAlpha = 0.15;
    ctx.fillRect(dx, dy, room.w, room.h);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = room.locked ? "#ef4444" : "#a3a3a3";
    ctx.lineWidth = room.locked ? 2 : 1;
    ctx.setLineDash(room.locked ? [6, 4] : []);
    ctx.strokeRect(dx, dy, room.w, room.h);
    ctx.setLineDash([]);

    ctx.font = "600 12px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#525252";
    ctx.textAlign = "left";
    ctx.fillText(
      room.locked ? `🔒 ${room.name}` : room.name,
      dx + 8,
      dy + 18
    );
  });
}

function drawObstacles(ctx: CanvasRenderingContext2D, camera: Camera, obstacles: Obstacle[]) {
  obstacles.forEach(obs => {
    const dx = obs.x - camera.x;
    const dy = obs.y - camera.y;

    ctx.fillStyle = "#d4d4d4";
    ctx.fillRect(dx, dy, obs.w, obs.h);
    ctx.strokeStyle = "#a3a3a3";
    ctx.lineWidth = 1;
    ctx.strokeRect(dx, dy, obs.w, obs.h);
  });
}

function drawPlayers(
  ctx: CanvasRenderingContext2D,
  players: PlayersMap,
  currentPosition: Position,
  camera: Camera,
  viewPortSize: ViewPortSize,
  remoteStreams: { [key: string]: { stream: MediaStream; username: string; position: { x: number; y: number } } },
  currentAvatar: string
) {
  const avatarSize = 40;
  const currentSocketId = (window as any).socketId;

  // Current user
  const drawX = currentPosition.x - camera.x;
  const drawY = currentPosition.y - camera.y;

  if (drawX >= -avatarSize && drawX <= viewPortSize.width + avatarSize &&
    drawY >= -avatarSize && drawY <= viewPortSize.height + avatarSize) {
    drawSinglePlayer(ctx, {
      drawX,
      drawY,
      avatarSize,
      username: JSON.parse(localStorage.getItem("user") || "{}").username || "You",
      isSelf: true,
      avatarKey: currentAvatar
    });
  }

  // Other players
  Object.entries(players).forEach(([socketId, player]) => {
    if (!player || !player.position || socketId === currentSocketId) return;

    const drawX = player.position.x - camera.x;
    const drawY = player.position.y - camera.y;

    if (
      drawX + avatarSize < -20 || drawX > viewPortSize.width + 20 ||
      drawY + avatarSize < -20 || drawY > viewPortSize.height + 20
    ) return;

    drawSinglePlayer(ctx, {
      drawX,
      drawY,
      avatarSize,
      username: player.username || 'Unknown',
      isSelf: false,
      avatarKey: player.avatar || "preset_1"
    });
  });
}

function drawSinglePlayer(ctx: CanvasRenderingContext2D, {
  drawX,
  drawY,
  avatarSize,
  username,
  isSelf,
  avatarKey,
}: {
  drawX: number;
  drawY: number;
  avatarSize: number;
  username: string;
  isSelf: boolean;
  avatarKey: string;
}) {
  const centerX = drawX + avatarSize / 2;
  const centerY = drawY + avatarSize / 2;
  const radius = avatarSize / 2;

  // Try to draw avatar image
  const img = getAvatarImage(avatarKey);
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, avatarSize, avatarSize);
    ctx.restore();
  } else {
    // Fallback circle
    ctx.fillStyle = isSelf ? "#171717" : "#525252";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // White border ring
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Username label
  ctx.font = "500 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  const tw = ctx.measureText(username).width;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(centerX - tw / 2 - 4, drawY - 16, tw + 8, 16);
  ctx.fillStyle = "white";
  ctx.fillText(username, centerX, drawY - 4);

  if (isSelf) {
    ctx.fillStyle = "rgba(23, 23, 23, 0.8)";
    ctx.font = "600 9px Inter, system-ui, sans-serif";
    const youW = ctx.measureText("YOU").width;
    ctx.fillRect(centerX - youW / 2 - 3, drawY + avatarSize + 4, youW + 6, 13);
    ctx.fillStyle = "white";
    ctx.fillText("YOU", centerX, drawY + avatarSize + 14);
  }
}