import { useEffect } from "react";
import { PlayersMap, Position, Camera, ViewPortSize, Obstacle } from "./types";

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  position: Position;
  camera: Camera;
  viewPortSize: ViewPortSize;
  players: PlayersMap;
  width: number;
  height: number;
  remoteStreams: { [key: string]: { stream: MediaStream; username: string; position: { x: number; y: number } } };
}

export const useCanvasDrawing = ({
  canvasRef,
  position,
  camera,
  viewPortSize,
  players,
  width,
  height,
  remoteStreams
}: UseCanvasDrawingProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with background
    ctx.fillStyle = "#2d5a27";
    ctx.fillRect(0, 0, viewPortSize.width, viewPortSize.height);

    // Draw environment
    drawEnvironment(ctx, camera, viewPortSize, width, height);

    // Draw all players (including current user)
    drawPlayers(ctx, players, position, camera, viewPortSize, remoteStreams);
  }, [players, position, camera, viewPortSize, width, height, remoteStreams]);
};

function drawEnvironment(ctx: CanvasRenderingContext2D, camera: Camera, viewPortSize: ViewPortSize, width: number, height: number) {
  // Draw grass texture
  drawGrassTexture(ctx, camera, viewPortSize, width, height);
  
  // Draw rooms and furniture
  drawRooms(ctx, camera);
  
  // Draw tables and chairs
  drawFurniture(ctx, camera);
  
  // Draw decorative elements
  drawDecorations(ctx, camera);
}

function drawGrassTexture(ctx: CanvasRenderingContext2D, camera: Camera, viewPortSize: ViewPortSize, width: number, height: number) {
  // Base grass color
  ctx.fillStyle = "#4a7c59";
  ctx.fillRect(0, 0, viewPortSize.width, viewPortSize.height);
  
  // Add grass pattern
  ctx.fillStyle = "#5d8a6b";
  for (let x = 0; x < width; x += 20) {
    for (let y = 0; y < height; y += 20) {
      const drawX = x - camera.x;
      const drawY = y - camera.y;
      
      if (drawX >= -20 && drawX <= viewPortSize.width + 20 && drawY >= -20 && drawY <= viewPortSize.height + 20) {
        if ((x + y) % 40 === 0) {
          ctx.fillRect(drawX, drawY, 3, 3);
        }
      }
    }
  }
  
  // Add path
  drawPath(ctx, camera, viewPortSize);
}

function drawPath(ctx: CanvasRenderingContext2D, camera: Camera, viewPortSize: ViewPortSize) {
  ctx.fillStyle = "#8b7355";
  ctx.strokeStyle = "#6b5a45";
  ctx.lineWidth = 2;
  
  // Main horizontal path
  const pathY = 400 - camera.y;
  if (pathY >= -50 && pathY <= viewPortSize.height + 50) {
    ctx.fillRect(0, pathY, viewPortSize.width, 60);
    ctx.strokeRect(0, pathY, viewPortSize.width, 60);
  }
  
  // Vertical connecting paths
  const paths = [200, 600, 1000, 1400];
  paths.forEach(pathX => {
    const drawX = pathX - camera.x;
    if (drawX >= -50 && drawX <= viewPortSize.width + 50) {
      ctx.fillRect(drawX, 0, 60, viewPortSize.height);
      ctx.strokeRect(drawX, 0, 60, viewPortSize.height);
    }
  });
}

function drawRooms(ctx: CanvasRenderingContext2D, camera: Camera) {
  const rooms = [
    // Meeting Room 1
    { x: 100, y: 100, w: 300, h: 200, color: "#8b4513", name: "Meeting Room" },
    // Lounge Area
    { x: 500, y: 150, w: 250, h: 180, color: "#654321", name: "Lounge" },
    // Conference Room
    { x: 850, y: 100, w: 350, h: 250, color: "#8b4513", name: "Conference" },
    // Break Room
    { x: 150, y: 500, w: 200, h: 150, color: "#a0522d", name: "Break Room" },
    // Study Area
    { x: 450, y: 550, w: 280, h: 200, color: "#8b4513", name: "Study Area" },
    // Gaming Zone
    { x: 800, y: 500, w: 300, h: 220, color: "#654321", name: "Gaming Zone" }
  ];

  rooms.forEach(room => {
    const drawX = room.x - camera.x;
    const drawY = room.y - camera.y;
    
    // Room floor
    ctx.fillStyle = room.color;
    ctx.fillRect(drawX, drawY, room.w, room.h);
    
    // Room walls
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 4;
    ctx.strokeRect(drawX, drawY, room.w, room.h);
    
    // Room name
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(room.name, drawX + room.w/2, drawY + 25);
    
    // Door
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(drawX + room.w/2 - 15, drawY + room.h - 5, 30, 5);
  });
}

function drawFurniture(ctx: CanvasRenderingContext2D, camera: Camera) {
  // Tables and chairs
  const furniture = [
    // Meeting room table and chairs
    { type: 'table', x: 180, y: 180, w: 140, h: 80 },
    { type: 'chair', x: 160, y: 160, w: 25, h: 25 },
    { type: 'chair', x: 340, y: 160, w: 25, h: 25 },
    { type: 'chair', x: 160, y: 280, w: 25, h: 25 },
    { type: 'chair', x: 340, y: 280, w: 25, h: 25 },
    
    // Lounge furniture
    { type: 'sofa', x: 520, y: 200, w: 80, h: 40 },
    { type: 'sofa', x: 620, y: 200, w: 80, h: 40 },
    { type: 'coffee_table', x: 580, y: 260, w: 60, h: 40 },
    
    // Conference room
    { type: 'conference_table', x: 900, y: 200, w: 250, h: 100 },
    { type: 'chair', x: 880, y: 180, w: 25, h: 25 },
    { type: 'chair', x: 920, y: 180, w: 25, h: 25 },
    { type: 'chair', x: 960, y: 180, w: 25, h: 25 },
    { type: 'chair', x: 1000, y: 180, w: 25, h: 25 },
    { type: 'chair', x: 1040, y: 180, w: 25, h: 25 },
    { type: 'chair', x: 1080, y: 180, w: 25, h: 25 },
    { type: 'chair', x: 1120, y: 180, w: 25, h: 25 },
    { type: 'chair', x: 1160, y: 180, w: 25, h: 25 },
    
    // Break room
    { type: 'table', x: 200, y: 550, w: 100, h: 60 },
    { type: 'chair', x: 180, y: 530, w: 25, h: 25 },
    { type: 'chair', x: 320, y: 530, w: 25, h: 25 },
    
    // Study area
    { type: 'desk', x: 480, y: 600, w: 80, h: 50 },
    { type: 'desk', x: 580, y: 600, w: 80, h: 50 },
    { type: 'chair', x: 490, y: 580, w: 25, h: 25 },
    { type: 'chair', x: 590, y: 580, w: 25, h: 25 },
    
    // Gaming zone
    { type: 'gaming_table', x: 850, y: 550, w: 100, h: 80 },
    { type: 'gaming_chair', x: 830, y: 530, w: 30, h: 30 },
    { type: 'gaming_chair', x: 970, y: 530, w: 30, h: 30 },
  ];

  furniture.forEach(item => {
    const drawX = item.x - camera.x;
    const drawY = item.y - camera.y;
    
    switch(item.type) {
      case 'table':
      case 'conference_table':
      case 'coffee_table':
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(drawX, drawY, item.w, item.h);
        ctx.strokeStyle = "#654321";
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, item.w, item.h);
        break;
        
      case 'chair':
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(drawX, drawY, item.w, item.h);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.strokeRect(drawX, drawY, item.w, item.h);
        break;
        
      case 'gaming_chair':
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(drawX, drawY, item.w, item.h);
        ctx.strokeStyle = "#cc0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, item.w, item.h);
        break;
        
      case 'sofa':
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(drawX, drawY, item.w, item.h);
        ctx.fillStyle = "#654321";
        ctx.fillRect(drawX + 5, drawY + 5, item.w - 10, item.h - 10);
        break;
        
      case 'desk':
        ctx.fillStyle = "#deb887";
        ctx.fillRect(drawX, drawY, item.w, item.h);
        ctx.strokeStyle = "#8b7355";
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, item.w, item.h);
        break;
        
      case 'gaming_table':
        ctx.fillStyle = "#000";
        ctx.fillRect(drawX, drawY, item.w, item.h);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 3;
        ctx.strokeRect(drawX, drawY, item.w, item.h);
        // Gaming surface
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(drawX + 10, drawY + 10, item.w - 20, item.h - 20);
        break;
    }
  });
}

function drawDecorations(ctx: CanvasRenderingContext2D, camera: Camera) {
  // Plants and decorative elements
  const decorations = [
    { type: 'plant', x: 450, y: 120, size: 20 },
    { type: 'plant', x: 780, y: 180, size: 25 },
    { type: 'plant', x: 400, y: 520, size: 18 },
    { type: 'plant', x: 750, y: 480, size: 22 },
    { type: 'water_cooler', x: 380, y: 450, size: 30 },
    { type: 'bookshelf', x: 750, y: 600, w: 40, h: 120 },
    { type: 'whiteboard', x: 950, y: 120, w: 100, h: 60 },
  ];

  decorations.forEach(item => {
    const drawX = item.x - camera.x;
    const drawY = item.y - camera.y;
    
    switch(item.type) {
      case 'plant':
        if (item.size) {
          // Pot
          ctx.fillStyle = "#8b4513";
          ctx.fillRect(drawX, drawY + item.size - 8, item.size, 8);
          // Plant
          ctx.fillStyle = "#228b22";
          ctx.beginPath();
          ctx.arc(drawX + item.size/2, drawY + item.size/2, item.size/2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'water_cooler':
        if (item.size) {
          ctx.fillStyle = "#4169e1";
          ctx.fillRect(drawX, drawY, item.size, item.size);
          ctx.fillStyle = "#87ceeb";
          ctx.fillRect(drawX + 5, drawY + 5, item.size - 10, item.size - 15);
        }
        break;
        
      case 'bookshelf':
        if (item.w && item.h) {
          ctx.fillStyle = "#8b4513";
          ctx.fillRect(drawX, drawY, item.w, item.h);
          // Shelves
          for(let i = 0; i < 4; i++) {
            ctx.fillStyle = "#654321";
            ctx.fillRect(drawX, drawY + i * 30, item.w, 3);
          }
        }
        break;
        
      case 'whiteboard':
        if (item.w && item.h) {
          ctx.fillStyle = "#f5f5f5";
          ctx.fillRect(drawX, drawY, item.w, item.h);
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;
          ctx.strokeRect(drawX, drawY, item.w, item.h);
        }
        break;
    }
  });
}

function drawPlayers(
  ctx: CanvasRenderingContext2D,
  players: PlayersMap,
  currentPosition: Position,
  camera: Camera,
  viewPortSize: ViewPortSize,
  remoteStreams: { [key: string]: { stream: MediaStream; username: string; position: { x: number; y: number } } }
) {
  const avatarSize = 40;
  
  // Get current socket ID
  const currentSocketId = (window as any).socketId;
  
  // First, draw the current user
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
      hasVideo: false,
      isScreenSharing: false
    });
  }
  
  // Then draw all other players
  Object.entries(players).forEach(([socketId, player]) => {
    if (!player || !player.position || socketId === currentSocketId) return;
    
    const drawX = player.position.x - camera.x;
    const drawY = player.position.y - camera.y;

    // Only draw if player is visible in viewport
    if (
      drawX + avatarSize < -20 || drawX > viewPortSize.width + 20 ||
      drawY + avatarSize < -20 || drawY > viewPortSize.height + 20
    ) return;

    // Check video stream status
    const hasVideo = remoteStreams[socketId]?.stream;
    const videoTrack = hasVideo ? remoteStreams[socketId].stream.getVideoTracks()[0] : null;
    const isScreenSharing = videoTrack && videoTrack.getSettings().displaySurface !== undefined;

    drawSinglePlayer(ctx, {
      drawX,
      drawY,
      avatarSize,
      username: player.username || 'Unknown',
      isSelf: false,
      hasVideo: !!hasVideo,
      isScreenSharing: !!isScreenSharing
    });
  });
}

function drawSinglePlayer(ctx: CanvasRenderingContext2D, {
  drawX,
  drawY,
  avatarSize,
  username,
  isSelf,
  hasVideo,
  isScreenSharing
}: {
  drawX: number;
  drawY: number;
  avatarSize: number;
  username: string;
  isSelf: boolean;
  hasVideo: boolean;
  isScreenSharing: boolean;
}) {
  // Choose avatar color based on status
  let avatarColor = "#FF9800"; // Default orange for no video
  if (isSelf) {
    avatarColor = "#4CAF50"; // Green for current user
  } else if (hasVideo) {
    avatarColor = isScreenSharing ? "#2196F3" : "#9C27B0"; // Blue for screen share, Purple for camera
  }

  // Draw avatar circle with shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.fillStyle = avatarColor;
  ctx.beginPath();
  ctx.arc(drawX + avatarSize / 2, drawY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Add border for better visibility
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw eyes
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(drawX + avatarSize / 3, drawY + avatarSize / 3, 4, 0, Math.PI * 2);
  ctx.arc(drawX + avatarSize * 2 / 3, drawY + avatarSize / 3, 4, 0, Math.PI * 2);
  ctx.fill();

  // Draw pupils
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(drawX + avatarSize / 3, drawY + avatarSize / 3, 2, 0, Math.PI * 2);
  ctx.arc(drawX + avatarSize * 2 / 3, drawY + avatarSize / 3, 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw smile
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(drawX + avatarSize / 2, drawY + avatarSize / 2 + 2, 8, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Draw username with background
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  
  // Measure text for background
  const textMetrics = ctx.measureText(username);
  const textWidth = textMetrics.width;
  const textHeight = 16;
  
  // Draw text background
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(
    drawX + avatarSize / 2 - textWidth / 2 - 4,
    drawY - textHeight - 8,
    textWidth + 8,
    textHeight + 4
  );
  
  // Draw username text
  ctx.fillStyle = "white";
  ctx.fillText(username, drawX + avatarSize / 2, drawY - 8);

  // Draw video status indicator
  if (hasVideo) {
    const indicatorSize = 12;
    const indicatorX = drawX + avatarSize - indicatorSize;
    const indicatorY = drawY;
    
    // Background circle
    ctx.fillStyle = isScreenSharing ? "#2196F3" : "#9C27B0";
    ctx.beginPath();
    ctx.arc(indicatorX + indicatorSize/2, indicatorY + indicatorSize/2, indicatorSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // White border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Icon
    ctx.fillStyle = "white";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      isScreenSharing ? "🖥" : "📹", 
      indicatorX + indicatorSize/2, 
      indicatorY + indicatorSize/2 + 3
    );
  }

  // Draw "YOU" indicator for current user
  if (isSelf) {
    ctx.fillStyle = "rgba(76, 175, 80, 0.9)";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    const youText = "YOU";
    const youMetrics = ctx.measureText(youText);
    
    ctx.fillRect(
      drawX + avatarSize / 2 - youMetrics.width / 2 - 3,
      drawY + avatarSize + 5,
      youMetrics.width + 6,
      14
    );
    
    ctx.fillStyle = "white";
    ctx.fillText(youText, drawX + avatarSize / 2, drawY + avatarSize + 16);
  }
}