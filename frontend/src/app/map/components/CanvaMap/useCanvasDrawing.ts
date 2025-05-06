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

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, viewPortSize.width, viewPortSize.height);

    drawGrid(ctx, camera, viewPortSize, width, height);

    const obstacles: Obstacle[] = [
      { x: 400, y: 300, w: 100, h: 100 },
      { x: 800, y: 600, w: 150, h: 100 },
      { x: 200, y: 600, w: 150, h: 100 },
      { x: 700, y: 300, w: 150, h: 100 },
      { x: 80, y: 60, w: 150, h: 100 },
    ];
    drawObstacles(ctx, camera, obstacles);

    drawPlayers(ctx, players, position, camera, viewPortSize, remoteStreams);
  }, [players, position, camera, viewPortSize, width, height, remoteStreams]);
};

function drawGrid(ctx: CanvasRenderingContext2D, camera: Camera, viewPortSize: ViewPortSize, width: number, height: number) {
  ctx.strokeStyle = "#ccc";
  for (let x = 0; x < width; x += 50) {
    const drawX = x - camera.x;
    if (drawX >= 0 && drawX <= viewPortSize.width) {
      ctx.beginPath();
      ctx.moveTo(drawX, 0);
      ctx.lineTo(drawX, viewPortSize.height);
      ctx.stroke();
    }
  }

  for (let y = 0; y < height; y += 50) {
    const drawY = y - camera.y;
    if (drawY >= 0 && drawY <= viewPortSize.height) {
      ctx.beginPath();
      ctx.moveTo(0, drawY);
      ctx.lineTo(viewPortSize.width, drawY);
      ctx.stroke();
    }
  }
}

function drawObstacles(ctx: CanvasRenderingContext2D, camera: Camera, obstacles: Obstacle[]) {
  ctx.fillStyle = '#888';
  obstacles.forEach(({ x, y, w, h }) => {
    ctx.fillRect(x - camera.x, y - camera.y, w, h);
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
  const videoSize = 60;
  Object.entries(players).forEach(([id, player]) => {
    const isSelf = player.position.x === currentPosition.x && player.position.y === currentPosition.y;
    const drawX = player.position.x - camera.x;
    const drawY = player.position.y - camera.y;

    if (
      drawX + avatarSize < 0 || drawX > viewPortSize.width ||
      drawY + avatarSize < 0 || drawY > viewPortSize.height
    ) return;

    // Draw player avatar
    ctx.fillStyle = isSelf ? "#4CAF50" : "#2196F3";
    ctx.beginPath();
    ctx.arc(drawX + avatarSize / 2, drawY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(drawX + avatarSize / 3, drawY + avatarSize / 3, 5, 0, Math.PI * 2);
    ctx.arc(drawX + avatarSize * 2 / 3, drawY + avatarSize / 3, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw mouth
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(drawX + avatarSize / 2, drawY + avatarSize / 2, 10, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Draw username
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(player.username, drawX, drawY - 10);

    //draw video container
    if(remoteStreams[id]?.stream){
      ctx.fillStyle = "rgba(0, 0, 0, 0,5)"
      ctx.fillRect(drawX - 10, drawY - videoSize - 20, videoSize, videoSize)
    }
  });
}