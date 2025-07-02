import { useEffect, useState } from "react";
import { Position, Camera, ViewPortSize } from "./types";

interface UsePlayerMovementProps {
  width: number;
  height: number;
}

export const usePlayerMovement = ({ width, height }: UsePlayerMovementProps) => {
  const [position, setPosition] = useState<Position>({ x: 300, y: 300 }); // Start in a better position
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [viewPortSize, setViewPortSize] = useState<ViewPortSize>({ width: 0, height: 0 });
  const [keys, setKeys] = useState<Set<string>>(new Set());
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

  // Handle key press and release
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
        const moveAmount = 8; // Smooth movement
        let newX = prevPosition.x;
        let newY = prevPosition.y;

        // Handle movement
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

        // Check collision with furniture and rooms
        const newPosition = { x: newX, y: newY };
        if (checkCollision(newPosition, avatarSize)) {
          return prevPosition; // Don't move if collision detected
        }

        return newPosition;
      });
    }, 16); // ~60 FPS

    return () => clearInterval(moveInterval);
  }, [keys, width, height]);

  // Update camera to follow player
  useEffect(() => {
    const halfHeight = viewPortSize.height / 2;
    const halfWidth = viewPortSize.width / 2;

    setCamera({
      x: Math.min(Math.max(position.x - halfWidth, 0), width - viewPortSize.width),
      y: Math.min(Math.max(position.y - halfHeight, 0), height - viewPortSize.height),
    });
  }, [position, width, height, viewPortSize]);

  return { position, camera, viewPortSize };
};

// Collision detection function
function checkCollision(position: Position, avatarSize: number): boolean {
  const playerRect = {
    x: position.x,
    y: position.y,
    w: avatarSize,
    h: avatarSize
  };

  // Define collision areas (furniture, walls, etc.)
  const obstacles = [
    // Meeting room furniture
    { x: 180, y: 180, w: 140, h: 80 }, // table
    { x: 160, y: 160, w: 25, h: 25 }, // chairs
    { x: 340, y: 160, w: 25, h: 25 },
    { x: 160, y: 280, w: 25, h: 25 },
    { x: 340, y: 280, w: 25, h: 25 },
    
    // Lounge furniture
    { x: 520, y: 200, w: 80, h: 40 }, // sofas
    { x: 620, y: 200, w: 80, h: 40 },
    { x: 580, y: 260, w: 60, h: 40 }, // coffee table
    
    // Conference room
    { x: 900, y: 200, w: 250, h: 100 }, // conference table
    
    // Other furniture
    { x: 200, y: 550, w: 100, h: 60 }, // break room table
    { x: 480, y: 600, w: 80, h: 50 }, // desks
    { x: 580, y: 600, w: 80, h: 50 },
    { x: 850, y: 550, w: 100, h: 80 }, // gaming table
    
    // Decorations
    { x: 450, y: 120, w: 20, h: 20 }, // plants
    { x: 780, y: 180, w: 25, h: 25 },
    { x: 400, y: 520, w: 18, h: 18 },
    { x: 750, y: 480, w: 22, h: 22 },
    { x: 380, y: 450, w: 30, h: 30 }, // water cooler
    { x: 750, y: 600, w: 40, h: 120 }, // bookshelf
  ];

  // Check collision with each obstacle
  for (const obstacle of obstacles) {
    if (
      playerRect.x < obstacle.x + obstacle.w &&
      playerRect.x + playerRect.w > obstacle.x &&
      playerRect.y < obstacle.y + obstacle.h &&
      playerRect.y + playerRect.h > obstacle.y
    ) {
      return true; // Collision detected
    }
  }

  return false; // No collision
}