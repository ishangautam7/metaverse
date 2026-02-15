import { useEffect, useState, useRef, useCallback } from "react";
import { Position, Camera, ViewPortSize, Decoration, Room } from "./types";

interface UsePlayerMovementProps {
  width: number;
  height: number;
  decorations: Decoration[];
  rooms: Room[];
  editMode: boolean;
}

export const usePlayerMovement = ({ width, height, decorations, rooms, editMode }: UsePlayerMovementProps) => {
  const [position, setPosition] = useState<Position>({ x: 300, y: 300 });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [viewPortSize, setViewPortSize] = useState<ViewPortSize>({ width: 0, height: 0 });
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [direction, setDirection] = useState<"up" | "down" | "left" | "right" | "idle">("idle");
  const keysRef = useRef<Set<string>>(new Set());
  const positionRef = useRef<Position>({ x: 300, y: 300 });
  const rafRef = useRef<number>(0);
  const avatarSize = 40;

  useEffect(() => {
    const updateSize = () => {
      setViewPortSize({
        width: window.innerWidth - 40,
        height: window.innerHeight - 25,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.delete(key);
    };

    // Clear keys on window blur (prevents stuck movement)
    const handleBlur = () => {
      keysRef.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Movement loop using requestAnimationFrame
  useEffect(() => {
    if (editMode) return; // No movement in edit mode

    let lastTime = 0;
    const speed = 200; // pixels per second

    const loop = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;

      const keys = keysRef.current;
      if (keys.size > 0) {
        const prev = positionRef.current;
        const moveAmount = speed * dt;
        let newX = prev.x;
        let newY = prev.y;
        let dir: "up" | "down" | "left" | "right" | "idle" = "idle";

        if (keys.has("w") || keys.has("arrowup")) {
          newY = Math.max(0, prev.y - moveAmount);
          dir = "up";
        }
        if (keys.has("s") || keys.has("arrowdown")) {
          newY = Math.min(height - avatarSize, prev.y + moveAmount);
          dir = "down";
        }
        if (keys.has("a") || keys.has("arrowleft")) {
          newX = Math.max(0, prev.x - moveAmount);
          dir = "left";
        }
        if (keys.has("d") || keys.has("arrowright")) {
          newX = Math.min(width - avatarSize, prev.x + moveAmount);
          dir = "right";
        }

        const newPos = { x: newX, y: newY };

        // Collision check: pass old AND new position
        if (!checkCollision(prev, newPos, avatarSize, decorations, rooms)) {
          positionRef.current = newPos;
          setPosition(newPos);
        }

        setDirection(dir);
      } else {
        setDirection("idle");
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, decorations, rooms, editMode]);

  // Track which room the player is in
  useEffect(() => {
    const cx = position.x + avatarSize / 2;
    const cy = position.y + avatarSize / 2;

    let foundRoom: string | null = null;
    for (const room of rooms) {
      if (cx >= room.x && cx <= room.x + room.w &&
        cy >= room.y && cy <= room.y + room.h) {
        foundRoom = room.roomId || room.name || null;
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
      x: Math.min(Math.max(position.x - halfWidth, 0), Math.max(0, width - viewPortSize.width)),
      y: Math.min(Math.max(position.y - halfHeight, 0), Math.max(0, height - viewPortSize.height)),
    });
  }, [position, width, height, viewPortSize]);

  return { position, camera, viewPortSize, currentRoom, direction };
};

function checkCollision(
  oldPos: Position,
  newPos: Position,
  avatarSize: number,
  decorations: Decoration[],
  rooms: Room[]
): boolean {
  const playerRect = {
    x: newPos.x,
    y: newPos.y,
    w: avatarSize,
    h: avatarSize,
  };

  // Check decorations (solid objects)
  for (const dec of decorations) {
    if (
      playerRect.x < dec.x + dec.w &&
      playerRect.x + playerRect.w > dec.x &&
      playerRect.y < dec.y + dec.h &&
      playerRect.y + playerRect.h > dec.y
    ) {
      return true;
    }
  }

  // Check locked room walls — only block ENTRY, not staying inside
  for (const room of rooms) {
    if (!room.locked) continue;

    // Was the player's center inside this room before?
    const oldCx = oldPos.x + avatarSize / 2;
    const oldCy = oldPos.y + avatarSize / 2;
    const wasInside = oldCx >= room.x && oldCx <= room.x + room.w &&
      oldCy >= room.y && oldCy <= room.y + room.h;

    // Is the player's center inside this room now?
    const newCx = newPos.x + avatarSize / 2;
    const newCy = newPos.y + avatarSize / 2;
    const isInside = newCx >= room.x && newCx <= room.x + room.w &&
      newCy >= room.y && newCy <= room.y + room.h;

    // Block entry from outside
    if (!wasInside && isInside) return true;
    // Block exit from inside (optional: keep players trapped when room is locked)
    // if (wasInside && !isInside) return true;
  }

  return false;
}