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
import { UserProfileModal } from "./UserProfileModal";
import { RoomEditor } from "../RoomEditor/RoomEditor";
import { Room, Decoration, Position } from "./types";
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

  const [unlockedRooms, setUnlockedRooms] = useState<Set<string>>(new Set());
  const [passcodePrompt, setPasscodePrompt] = useState<Room | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const handleRoomAccessRequested = useCallback((room: Room) => {
    setPasscodePrompt(room);
    setPasscodeInput('');
    setPasscodeError(false);
  }, []);

  const { position, camera, viewPortSize, currentRoom, direction } = usePlayerMovement({
    width, height, decorations, rooms, editMode,
    unlockedRooms,
    onRoomAccessRequested: handleRoomAccessRequested
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

  const [interactableObject, setInteractableObject] = useState<{ dec: Decoration, dist: number } | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<{ username: string, avatar: string, x: number, y: number } | null>(null);

  // Check proximity to decorations
  useEffect(() => {
    if (editMode) {
      setInteractableObject(null);
      return;
    }
    const interactionRange = 60; // pixels
    let closest: { dec: Decoration, dist: number } | null = null;
    let minDist = interactionRange;

    for (const dec of decorations) {
      // rough distance to center of object
      const ox = dec.x + dec.w / 2;
      const oy = dec.y + dec.h / 2;
      const px = position.x + 20; // player center roughly (using size 40)
      const py = position.y + 20;
      
      const dx = ox - px;
      const dy = oy - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only make certain decorations interactable for now
      if (dist < minDist && (dec.type === 'bookshelf' || dec.type === 'desk' || dec.type === 'table')) {
        minDist = dist;
        closest = { dec, dist };
      }
    }
    setInteractableObject(closest);
  }, [position.x, position.y, decorations, editMode]);

  const { players, chatHistory, sendChatMessage } = useSocket({
    mapUID, username, position, localStream, setRemoteStreams
  });

  useCanvasDrawing({
    canvasRef, position, camera, viewPortSize, players,
    width, height, remoteStreams, rooms, decorations,
    currentAvatar, currentRoom, editMode,
    selectedItem
  });



  const handleInteract = useCallback(() => {
    if (interactableObject) {
      toast(`Interacted with ${interactableObject.dec.type}`);
    }
  }, [interactableObject]);

  // Global keydown listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editMode || passcodePrompt) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'f') {
        handleInteract();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, handleInteract]);

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
              // Request both video and system audio
              const ss = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
              
              if (!isMuted) {
                try {
                  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                  // Add microphone tracks to the screen share stream
                  micStream.getAudioTracks().forEach(track => ss.addTrack(track));
                } catch (e) { console.error("Could not capture mic audio:", e); }
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

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode) return;
    
    // Check if we clicked a player
    const { wx, wy } = getWorldCoords(e);
    const avatarSize = 40;
    
    // Check local player
    const px = position.x;
    const py = position.y;
    if (wx >= px && wx <= px + avatarSize && wy >= py && wy <= py + avatarSize) {
      setSelectedProfile({
        username: username,
        avatar: currentAvatar,
        x: e.clientX,
        y: e.clientY
      });
      return;
    }

    // Check remote players
    for (const [id, player] of Object.entries(players)) {
      if (player.position) {
        const ppx = player.position.x;
        const ppy = player.position.y;
        if (wx >= ppx && wx <= ppx + avatarSize && wy >= ppy && wy <= ppy + avatarSize) {
           setSelectedProfile({
             username: player.username,
             avatar: player.avatar || 'preset_1',
             x: e.clientX,
             y: e.clientY
           });
           return;
        }
      }
    }
  }, [editMode, getWorldCoords, position, username, currentAvatar, players]);

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

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodePrompt) return;
    if (passcodeInput === passcodePrompt.passcode) {
      setUnlockedRooms(prev => {
        const next = new Set(prev);
        next.add(passcodePrompt.roomId || passcodePrompt.name);
        return next;
      });
      setPasscodePrompt(null);
      toast.success("Room Unlocked");
    } else {
      setPasscodeError(true);
      toast.error("Incorrect Passcode");
    }
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
        onClick={handleCanvasClick}
      />

      {/* Current room HUD */}
      {!editMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur text-white text-xs px-4 py-1.5 rounded-full z-50 border border-neutral-700 flex items-center gap-2">
          {currentRoom ? (
            <>
              {rooms.find(r => (r.roomId || r.name) === currentRoom)?.name || "Room"}
            </>
          ) : null}
        </div>
      )}

      {/* Interactive Object HUD */}
      {!editMode && interactableObject && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm px-4 py-2 rounded-full z-50 shadow-lg animate-bounce flex items-center gap-2 cursor-pointer hover:bg-blue-500"
             onClick={() => toast(`Interacted with ${interactableObject.dec.type}`)}>
          ✨ Press F or click to interact with {interactableObject.dec.type}
        </div>
      )}

      {/* Remote video overlays */}
      {Object.entries(remoteStreams).map(([id, { stream, username: u, position: p }]) => (
        <PlayerVideoOverlay
          key={id} stream={stream} username={u} position={p}
          camera={camera} viewPortSize={viewPortSize}
        />
      ))}

      <ChatOverlay onSendMessage={sendChatMessage} chatHistory={chatHistory} players={players} />

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

      {/* User Profile Modal */}
      {selectedProfile && (
        <UserProfileModal 
          username={selectedProfile.username}
          avatarKey={selectedProfile.avatar}
          x={selectedProfile.x}
          y={selectedProfile.y}
          onClose={() => setSelectedProfile(null)}
        />
      )}

      {/* Passcode Prompt Modal */}
      {passcodePrompt && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center">
           <form 
              onSubmit={handlePasscodeSubmit}
              className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl shadow-2xl w-80 text-center animate-in zoom-in-95"
           >
              <h3 className="text-xl font-bold text-white mb-2">Room Locked</h3>
              <p className="text-xs text-neutral-400 mb-4">Enter passcode to access <b>{passcodePrompt.name}</b></p>
              
              <input 
                type="password"
                autoFocus
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setPasscodeError(false);
                }}
                className={`w-full bg-neutral-800 border ${passcodeError ? 'border-red-500' : 'border-neutral-600'} rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors mb-4`}
                placeholder="Passcode..."
              />
              
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setPasscodePrompt(null)}
                  className="flex-1 py-2 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Unlock
                </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default CanvaMap;