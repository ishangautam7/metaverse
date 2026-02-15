"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { usePlayerMovement } from "./usePlayerMovement";
import { useSocket } from "./useSocket";
import { useCanvasDrawing } from "./useCanvasDrawing";
import { VideoChat } from "../VideoChat/VideoChat";
import toast from "react-hot-toast";
import { PlayerVideoOverlay } from "./PlayerVideoOverlay";
import { useRouter } from "next/navigation";
import { ChatOverlay } from "./ChatOverlay";
import { RoomEditor } from "../RoomEditor/RoomEditor";
import { Room, Decoration } from "./types";
import axios from "axios";
import { getLayoutRoute, host } from "@/utils/Routes";
import { io } from "socket.io-client";

interface AvatarCanvasProps {
  width: number;
  height: number;
  mapUID: number;
  username: string;
}

interface DragState {
  type: "room" | "decoration";
  index: number;
  offsetX: number;
  offsetY: number;
}

const CanvaMap = ({ username, mapUID, width = 1800, height = 1000 }: AvatarCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [mapId, setMapId] = useState<string>("");
  const [currentAvatar, setCurrentAvatar] = useState<string>(
    () => JSON.parse(localStorage.getItem("user") || "{}").avatar || "preset_1"
  );

  // Drag-and-drop state
  const dragRef = useRef<DragState | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: "room" | "decoration"; index: number } | null>(null);
  const [canvasCursor, setCanvasCursor] = useState("default");

  const { position, camera, viewPortSize, currentRoom, direction } = usePlayerMovement({
    width, height, decorations, rooms, editMode
  });
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [key: string]: {
      stream: MediaStream;
      username: string;
      position: { x: number; y: number };
    };
  }>({});

  const { players, chatHistory, sendChatMessage } = useSocket({
    mapUID, username, position, localStream, setRemoteStreams
  });

  useCanvasDrawing({
    canvasRef, position, camera, viewPortSize, players,
    width, height, remoteStreams, rooms, decorations,
    currentAvatar, currentRoom, editMode,
    selectedItem
  });

  // Fetch layout
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await axios.get(`${getLayoutRoute}/${mapUID}`);
        setRooms(res.data.rooms || []);
        setDecorations(res.data.decorations || []);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user._id === res.data.ownerId || user.id === res.data.ownerId) {
          setIsOwner(true);
        }
      } catch {
        // empty map
      }
    };
    fetchLayout();
  }, [mapUID]);

  // Fetch mapId
  useEffect(() => {
    const fetchMapId = async () => {
      try {
        const res = await axios.get(`${host}/api/space/fetch/${mapUID}`);
        if (res.data.map?._id) setMapId(res.data.map._id);
      } catch { /* ignore */ }
    };
    fetchMapId();
  }, [mapUID]);

  // Send rooms to server
  useEffect(() => {
    const s = io(host);
    s.emit("setRooms", { mapUID, rooms });
    return () => { s.disconnect(); };
  }, [rooms, mapUID]);

  // Media initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    const initMedia = async () => {
      try {
        if (localStream) {
          localStream.getTracks().forEach(t => t.stop());
          setLocalStream(null);
        }
        if (isCameraOn || !isMuted || isSharingScreen) {
          if (isSharingScreen) {
            try {
              const ss = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
              if (!isMuted) {
                try {
                  const as2 = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                  const at = as2.getAudioTracks()[0];
                  if (at) ss.addTrack(at);
                } catch { /* no audio */ }
              }
              stream = ss;
              ss.getVideoTracks()[0].onended = () => setIsSharingScreen(false);
            } catch {
              setIsSharingScreen(false);
              toast.error("Failed to start screen sharing");
              return;
            }
          } else {
            stream = await navigator.mediaDevices.getUserMedia({ video: isCameraOn, audio: !isMuted });
          }
          setLocalStream(stream);
        }
      } catch {
        setIsCameraOn(false);
        setIsSharingScreen(false);
        toast.error("Failed to access camera/microphone");
      }
    };
    initMedia();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [isCameraOn, isMuted, isSharingScreen]);

  // === Drag-and-drop handlers ===
  const getWorldCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { wx: 0, wy: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    return { wx: cx + camera.x, wy: cy + camera.y };
  }, [camera]);

  const findItemAt = useCallback((wx: number, wy: number): { type: "room" | "decoration"; index: number } | null => {
    // Check decorations first (they render on top)
    for (let i = decorations.length - 1; i >= 0; i--) {
      const d = decorations[i];
      if (wx >= d.x && wx <= d.x + d.w && wy >= d.y && wy <= d.y + d.h) {
        return { type: "decoration", index: i };
      }
    }
    // Then rooms
    for (let i = rooms.length - 1; i >= 0; i--) {
      const r = rooms[i];
      if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) {
        return { type: "room", index: i };
      }
    }
    return null;
  }, [rooms, decorations]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editMode) return;
    const { wx, wy } = getWorldCoords(e);
    const item = findItemAt(wx, wy);
    if (item) {
      const obj = item.type === "room" ? rooms[item.index] : decorations[item.index];
      dragRef.current = {
        type: item.type,
        index: item.index,
        offsetX: wx - obj.x,
        offsetY: wy - obj.y,
      };
      setSelectedItem(item);
      setCanvasCursor("grabbing");
    } else {
      setSelectedItem(null);
    }
  }, [editMode, getWorldCoords, findItemAt, rooms, decorations]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editMode) return;

    const { wx, wy } = getWorldCoords(e);

    if (dragRef.current) {
      const { type, index, offsetX, offsetY } = dragRef.current;
      const newX = Math.max(0, Math.min(width - 20, wx - offsetX));
      const newY = Math.max(0, Math.min(height - 20, wy - offsetY));

      if (type === "room") {
        setRooms(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], x: Math.round(newX), y: Math.round(newY) };
          return updated;
        });
      } else {
        setDecorations(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], x: Math.round(newX), y: Math.round(newY) };
          return updated;
        });
      }
    } else {
      // Hover cursor
      const item = findItemAt(wx, wy);
      setCanvasCursor(item ? "grab" : "crosshair");
    }
  }, [editMode, getWorldCoords, findItemAt, width, height]);

  const handleCanvasMouseUp = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null;
      setCanvasCursor("grab");
    }
  }, []);

  const handleToggleScreenShare = () => {
    if (isSharingScreen) setIsSharingScreen(false);
    else { setIsCameraOn(false); setIsSharingScreen(true); }
  };

  const router = useRouter();
  const handleExitRoom = () => router.push(window.location.href.split("/map")[0]);

  const handleLayoutUpdate = (newRooms: Room[], newDecs: Decoration[]) => {
    setRooms(newRooms);
    setDecorations(newDecs);
    toast.success("Layout saved");
  };

  return (
    <div className="max-h-screen overflow-hidden flex flex-col items-center relative bg-neutral-100">
      <canvas
        ref={canvasRef}
        width={viewPortSize.width}
        height={viewPortSize.height}
        className="bg-white"
        style={{ cursor: editMode ? canvasCursor : "default" }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />

      {/* Current room HUD */}
      {currentRoom && !editMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur text-white text-xs px-4 py-1.5 rounded-full z-50 border border-neutral-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          {rooms.find(r => (r.roomId || r.name) === currentRoom)?.name || "Room"}
        </div>
      )}

      {/* Remote video overlays */}
      {Object.entries(remoteStreams).map(([id, { stream, username: u, position: p }]) => (
        <PlayerVideoOverlay
          key={id} stream={stream} username={u} position={p}
          camera={camera} viewPortSize={viewPortSize}
        />
      ))}

      <ChatOverlay onSendMessage={sendChatMessage} chatHistory={chatHistory} />

      <VideoChat
        localStream={localStream}
        isMuted={isMuted}
        isCameraOn={isCameraOn}
        isSharingScreen={isSharingScreen}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleCamera={() => {
          if (isSharingScreen) setIsSharingScreen(false);
          setIsCameraOn(!isCameraOn);
        }}
        onToggleScreenShare={handleToggleScreenShare}
        remoteStreams={remoteStreams}
        handleExitRoom={handleExitRoom}
        isOwner={isOwner}
        editMode={editMode}
        onToggleEditMode={() => setEditMode(!editMode)}
      />

      {/* Settings panel (edit mode) */}
      {editMode && mapId && (
        <RoomEditor
          mapId={mapId}
          rooms={rooms}
          decorations={decorations}
          currentAvatar={currentAvatar}
          onUpdate={handleLayoutUpdate}
          onAvatarChange={(a) => setCurrentAvatar(a)}
          onClose={() => setEditMode(false)}
        />
      )}
    </div>
  );
};

export default CanvaMap;