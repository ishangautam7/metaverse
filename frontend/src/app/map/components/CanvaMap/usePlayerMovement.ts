import { useEffect, useState } from "react";
import { Position, Camera, ViewPortSize, Obstacle, Room } from "./types";

interface UsePlayerMovementProps {
  width: number;
  height: number;
  obstacles: Obstacle[];
  rooms: Room[];
}

export const usePlayerMovement = ({ width, height, obstacles, rooms }: UsePlayerMovementProps) => {
  const [position, setPosition] = useState<Position>({ x: 300, y: 300 });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [viewPortSize, setViewPortSize] = useState<ViewPortSize>({ width: 0, height: 0 });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const avatarSize = 40;

  useEffect(() => {
    const updateSize = () => {
      setViewPortSize({
        width: window.innerWidth - 40,
        height: window.innerHeight - 25,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        setKeys(prev => new Set(prev).add(key));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(key);
        return newKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Movement loop
  useEffect(() => {
    if (keys.size === 0) return;

    const moveInterval = setInterval(() => {
      setPosition(prevPosition => {
        const moveAmount = 8;
        let newX = prevPosition.x;
        let newY = prevPosition.y;

        if (keys.has("w") || keys.has("arrowup")) {
          newY = Math.max(0, prevPosition.y - moveAmount);
        }
        if (keys.has("s") || keys.has("arrowdown")) {
          newY = Math.min(height - avatarSize, prevPosition.y + moveAmount);
        }
        if (keys.has("a") || keys.has("arrowleft")) {
          newX = Math.max(0, prevPosition.x - moveAmount);
        }
        if (keys.has("d") || keys.has("arrowright")) {
          newX = Math.min(width - avatarSize, prevPosition.x + moveAmount);
        }

        const newPosition = { x: newX, y: newY };
        if (checkCollision(newPosition, avatarSize, obstacles, rooms)) {
          return prevPosition;
        }

        return newPosition;
      });
    }, 16);

    return () => clearInterval(moveInterval);
  }, [keys, width, height, obstacles, rooms]);

  // Track which room the player is in
  useEffect(() => {
    const cx = position.x + avatarSize / 2;
    const cy = position.y + avatarSize / 2;

    let foundRoom: string | null = null;
    for (const room of rooms) {
      if (cx >= room.x && cx <= room.x + room.w &&
        cy >= room.y && cy <= room.y + room.h) {
        foundRoom = room.roomId || null;
        break;
      }
    }
    setCurrentRoom(foundRoom);
  }, [position, rooms]);

  // Update camera
  useEffect(() => {
    const halfHeight = viewPortSize.height / 2;
    const halfWidth = viewPortSize.width / 2;

    setCamera({
      x: Math.min(Math.max(position.x - halfWidth, 0), width - viewPortSize.width),
      y: Math.min(Math.max(position.y - halfHeight, 0), height - viewPortSize.height),
    });
  }, [position, width, height, viewPortSize]);

  return { position, camera, viewPortSize, currentRoom };
};

function checkCollision(position: Position, avatarSize: number, obstacles: Obstacle[], rooms: Room[]): boolean {
  const playerRect = {
    x: position.x,
    y: position.y,
    w: avatarSize,
    h: avatarSize
  };

  // Check obstacles
  for (const obs of obstacles) {
    if (
      playerRect.x < obs.x + obs.w &&
      playerRect.x + playerRect.w > obs.x &&
      playerRect.y < obs.y + obs.h &&
      playerRect.y + playerRect.h > obs.y
    ) {
      return true;
    }
  }

  // Check locked room walls (can't enter locked rooms)
  for (const room of rooms) {
    if (!room.locked) continue;

    const cx = position.x + avatarSize / 2;
    const cy = position.y + avatarSize / 2;
    const wasInside = cx >= room.x && cx <= room.x + room.w && cy >= room.y && cy <= room.y + room.h;

    if (!wasInside) {
      // Trying to enter — check if new position is inside
      const newCx = position.x + avatarSize / 2;
      const newCy = position.y + avatarSize / 2;
      if (newCx >= room.x && newCx <= room.x + room.w &&
        newCy >= room.y && newCy <= room.y + room.h) {
        return true; // Block entry to locked rooms
      }
    }
  }

  return false;
}