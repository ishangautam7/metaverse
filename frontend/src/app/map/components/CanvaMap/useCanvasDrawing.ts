import { useEffect, useRef } from "react";
import { PlayersMap, Position, Camera, ViewPortSize, Decoration, Room } from "./types";
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
  decorations: Decoration[];
  currentAvatar: string;
  currentRoom: string | null;
  editMode: boolean;
  selectedItem?: { type: "room" | "decoration"; index: number } | null;
}

const avatarImageCache: { [key: string]: HTMLImageElement } = {};

function getAvatarImage(avatarKey: string): HTMLImageElement | null {
  if (avatarImageCache[avatarKey]) return avatarImageCache[avatarKey];

  let src: string;
  if (avatarKey.startsWith("data:")) src = avatarKey;
  else if (AVATAR_PRESETS[avatarKey]) src = AVATAR_PRESETS[avatarKey];
  else src = AVATAR_PRESETS["preset_1"];

  const img = new Image();
  img.src = src;
  img.onload = () => { avatarImageCache[avatarKey] = img; };

  if (img.complete) {
    avatarImageCache[avatarKey] = img;
    return img;
  }
  return null;
}

export const useCanvasDrawing = ({
  canvasRef, position, camera, viewPortSize, players,
  width, height, remoteStreams, rooms, decorations,
  currentAvatar, currentRoom, editMode, selectedItem
}: UseCanvasDrawingProps) => {
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

    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, viewPortSize.width, viewPortSize.height);

    drawGrid(ctx, camera, viewPortSize, width, height);
    drawRooms(ctx, camera, rooms, currentRoom, editMode);
    drawDecorations(ctx, camera, decorations, editMode);
    drawPlayers(ctx, players, position, camera, viewPortSize, remoteStreams, currentAvatar, currentRoom, rooms);

    if (editMode) {
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, 0, viewPortSize.width, viewPortSize.height);
      // Edit mode indicator
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.font = "600 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("EDIT MODE", 12, 24);
      ctx.restore();

      // Selection highlight
      if (selectedItem) {
        const item = selectedItem.type === "room"
          ? rooms[selectedItem.index]
          : decorations[selectedItem.index];
        if (item) {
          const sx = item.x - camera.x;
          const sy = item.y - camera.y;
          ctx.save();
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 3]);
          ctx.strokeRect(sx - 3, sy - 3, item.w + 6, item.h + 6);
          ctx.setLineDash([]);
          // Corner handles
          const hs = 6;
          ctx.fillStyle = "#3b82f6";
          [[sx - hs / 2, sy - hs / 2], [sx + item.w - hs / 2, sy - hs / 2],
          [sx - hs / 2, sy + item.h - hs / 2], [sx + item.w - hs / 2, sy + item.h - hs / 2]].forEach(([hx, hy]) => {
            ctx.fillRect(hx, hy, hs, hs);
          });
          ctx.restore();
        }
      }
    }
  }, [players, position, camera, viewPortSize, width, height, remoteStreams, rooms, decorations, currentAvatar, currentRoom, editMode, selectedItem]);
};

function drawGrid(ctx: CanvasRenderingContext2D, camera: Camera, vp: ViewPortSize, w: number, h: number) {
  ctx.strokeStyle = "#ebebeb";
  ctx.lineWidth = 1;
  const gs = 40;
  const sx = Math.floor(camera.x / gs) * gs - camera.x;
  const sy = Math.floor(camera.y / gs) * gs - camera.y;
  for (let x = sx; x <= vp.width; x += gs) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, vp.height); ctx.stroke();
  }
  for (let y = sy; y <= vp.height; y += gs) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(vp.width, y); ctx.stroke();
  }
  ctx.strokeStyle = "#d4d4d4";
  ctx.lineWidth = 2;
  ctx.strokeRect(-camera.x, -camera.y, w, h);
}

function drawRooms(ctx: CanvasRenderingContext2D, camera: Camera, rooms: Room[], currentRoom: string | null, editMode: boolean) {
  rooms.forEach(room => {
    const dx = room.x - camera.x;
    const dy = room.y - camera.y;
    const isInRoom = currentRoom === (room.roomId || room.name);

    // Room fill
    ctx.fillStyle = room.color || "#e0e7ff";
    ctx.globalAlpha = isInRoom ? 0.2 : 0.1;
    ctx.fillRect(dx, dy, room.w, room.h);
    ctx.globalAlpha = 1;

    // Room border
    if (room.locked) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
    } else if (isInRoom) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = "#a3a3a3";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
    }
    ctx.strokeRect(dx, dy, room.w, room.h);
    ctx.setLineDash([]);

    // Room label
    ctx.font = "600 11px Inter, system-ui, sans-serif";
    ctx.fillStyle = room.locked ? "#ef4444" : "#525252";
    ctx.textAlign = "left";
    const label = room.locked ? `🔒 ${room.name}` : room.name;
    ctx.fillText(label, dx + 8, dy + 16);

    // Edit mode: show drag handles
    if (editMode) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.5)";
      ctx.fillRect(dx + room.w - 8, dy + room.h - 8, 8, 8);
    }
  });
}

// Decoration drawing with distinct shapes per type
const DECORATION_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  table: { fill: "#d4a574", stroke: "#a67c52", label: "T" },
  plant: { fill: "#86efac", stroke: "#22c55e", label: "🌱" },
  bookshelf: { fill: "#c4b5fd", stroke: "#8b5cf6", label: "B" },
  sofa: { fill: "#fca5a5", stroke: "#ef4444", label: "S" },
  desk: { fill: "#d6d3d1", stroke: "#78716c", label: "D" },
  divider: { fill: "#e5e7eb", stroke: "#9ca3af", label: "|" },
  lamp: { fill: "#fde68a", stroke: "#f59e0b", label: "L" },
  generic: { fill: "#d4d4d8", stroke: "#a1a1aa", label: "○" },
};

function drawDecorations(ctx: CanvasRenderingContext2D, camera: Camera, decorations: Decoration[], editMode: boolean) {
  decorations.forEach(dec => {
    const dx = dec.x - camera.x;
    const dy = dec.y - camera.y;
    const style = DECORATION_COLORS[dec.type] || DECORATION_COLORS.generic;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(dx + 2, dy + 2, dec.w, dec.h);

    // Body
    ctx.fillStyle = style.fill;
    if (dec.type === "plant") {
      // Rounded
      const r = Math.min(dec.w, dec.h) / 4;
      ctx.beginPath();
      ctx.roundRect(dx, dy, dec.w, dec.h, r);
      ctx.fill();
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (dec.type === "sofa") {
      // Rounded rectangle
      ctx.beginPath();
      ctx.roundRect(dx, dy, dec.w, dec.h, 6);
      ctx.fill();
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (dec.type === "divider") {
      ctx.fillRect(dx, dy, dec.w, dec.h);
      // Dashed pattern
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(dx, dy, dec.w, dec.h);
      ctx.setLineDash([]);
    } else {
      ctx.fillRect(dx, dy, dec.w, dec.h);
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx, dy, dec.w, dec.h);
    }

    // Label
    ctx.font = "600 10px Inter, system-ui, sans-serif";
    ctx.fillStyle = style.stroke;
    ctx.textAlign = "center";
    ctx.fillText(style.label, dx + dec.w / 2, dy + dec.h / 2 + 4);

    // Edit mode drag handle
    if (editMode) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.5)";
      ctx.fillRect(dx + dec.w - 6, dy + dec.h - 6, 6, 6);
    }
  });
}

function drawPlayers(
  ctx: CanvasRenderingContext2D,
  players: PlayersMap,
  currentPosition: Position,
  camera: Camera,
  vp: ViewPortSize,
  remoteStreams: { [key: string]: { stream: MediaStream; username: string; position: { x: number; y: number } } },
  currentAvatar: string,
  currentRoom: string | null,
  rooms: Room[]
) {
  const avatarSize = 40;
  const currentSocketId = (window as any).socketId;

  // Current user
  const myDx = currentPosition.x - camera.x;
  const myDy = currentPosition.y - camera.y;
  if (myDx >= -avatarSize && myDx <= vp.width + avatarSize &&
    myDy >= -avatarSize && myDy <= vp.height + avatarSize) {
    drawSinglePlayer(ctx, myDx, myDy, avatarSize,
      JSON.parse(localStorage.getItem("user") || "{}").username || "You",
      true, currentAvatar);
  }

  // Other players
  Object.entries(players).forEach(([socketId, player]) => {
    if (!player?.position || socketId === currentSocketId) return;

    // Hide players inside locked rooms if viewer is outside
    const playerRoom = player.currentRoom;
    if (playerRoom) {
      const room = rooms.find(r => (r.roomId || r.name) === playerRoom);
      if (room?.locked && currentRoom !== playerRoom) return; // Hidden
    }

    const dx = player.position.x - camera.x;
    const dy = player.position.y - camera.y;
    if (dx + avatarSize < -20 || dx > vp.width + 20 ||
      dy + avatarSize < -20 || dy > vp.height + 20) return;

    drawSinglePlayer(ctx, dx, dy, avatarSize,
      player.username || 'Unknown', false,
      player.avatar || "preset_1");
  });
}

function drawSinglePlayer(
  ctx: CanvasRenderingContext2D,
  drawX: number, drawY: number,
  avatarSize: number,
  username: string,
  isSelf: boolean,
  avatarKey: string
) {
  const cx = drawX + avatarSize / 2;
  const cy = drawY + avatarSize / 2;
  const r = avatarSize / 2;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(cx, drawY + avatarSize + 2, r * 0.7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Avatar image or fallback
  const img = getAvatarImage(avatarKey);
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, avatarSize, avatarSize);
    ctx.restore();
  } else {
    ctx.fillStyle = isSelf ? "#3b82f6" : "#6b7280";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Border ring
  ctx.strokeStyle = isSelf ? "#fff" : "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Username
  ctx.font = "500 10px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  const tw = ctx.measureText(username).width;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath();
  ctx.roundRect(cx - tw / 2 - 5, drawY - 18, tw + 10, 16, 4);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(username, cx, drawY - 6);

  if (isSelf) {
    ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
    ctx.font = "700 8px Inter, system-ui, sans-serif";
    const youW = ctx.measureText("YOU").width;
    ctx.beginPath();
    ctx.roundRect(cx - youW / 2 - 3, drawY + avatarSize + 5, youW + 6, 12, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText("YOU", cx, drawY + avatarSize + 14);
  }
}