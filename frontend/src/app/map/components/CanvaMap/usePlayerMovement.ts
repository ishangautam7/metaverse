import { useEffect, useState } from "react";
import { Position, Camera, ViewPortSize } from "./types";

interface UsePlayerMovementProps {
  width: number;
  height: number;
}

export const usePlayerMovement = ({ width, height }: UsePlayerMovementProps) => {
  const [position, setPosition] = useState<Position>({ x: width / 2, y: height / 2 });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [viewPortSize, setViewPortSize] = useState<ViewPortSize>({ width: 0, height: 0 });
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
      const moveAmount = 10;
      const newPosition = { ...position };

      switch (e.key.toLowerCase()) {
        case "w":
          newPosition.y = Math.max(0, position.y - moveAmount);
          break;
        case "a":
          newPosition.x = Math.max(0, position.x - moveAmount);
          break;
        case "s":
          newPosition.y = Math.min(height - avatarSize, position.y + moveAmount);
          break;
        case "d":
          newPosition.x = Math.min(width - avatarSize, position.x + moveAmount);
          break;
        default:
          return;
      }

      setPosition(newPosition);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [position, width, height]);

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