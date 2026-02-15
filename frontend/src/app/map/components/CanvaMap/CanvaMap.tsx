"use client";

import { useRef, useState, useEffect } from "react";
import { usePlayerMovement } from "./usePlayerMovement";
import { useSocket } from "./useSocket";
import { useCanvasDrawing } from "./useCanvasDrawing";
import { VideoChat } from "../VideoChat/VideoChat";
import toast from "react-hot-toast";
import { PlayerVideoOverlay } from "./PlayerVideoOverlay";
import { useRouter } from "next/navigation";
import { ChatOverlay } from "./ChatOverlay";
import { RoomEditor } from "../RoomEditor/RoomEditor";
import { AvatarPicker } from "../AvatarPicker/AvatarPicker";
import { AVATAR_PRESETS } from "../AvatarPicker/avatarPresets";
import { Room, Obstacle } from "./types";
import axios from "axios";
import { getLayoutRoute, host } from "@/utils/Routes";
import { io } from "socket.io-client";
import { Settings, User } from "lucide-react";

interface AvatarCanvasProps {
  width: number;
  height: number;
  mapUID: number;
  username: string;
}

const CanvaMap = ({ username, mapUID, width = 1800, height = 1000 }: AvatarCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [mapId, setMapId] = useState<string>("");
  const [currentAvatar, setCurrentAvatar] = useState<string>(
    () => JSON.parse(localStorage.getItem("user") || "{}").avatar || "preset_1"
  );

  const { position, camera, viewPortSize, currentRoom } = usePlayerMovement({ width, height, obstacles, rooms });
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
    mapUID,
    username,
    position,
    localStream,
    setRemoteStreams,
  });

  useCanvasDrawing({
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
    currentAvatar,
  });

  // Fetch layout
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await axios.get(`${getLayoutRoute}/${mapUID}`);
        setRooms(res.data.rooms || []);
        setObstacles(res.data.obstacles || []);

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
      } catch {
        // ignore
      }
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
          localStream.getTracks().forEach((track) => track.stop());
          setLocalStream(null);
        }

        if (isCameraOn || !isMuted || isSharingScreen) {
          if (isSharingScreen) {
            try {
              const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
              if (!isMuted) {
                try {
                  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                  const audioTrack = audioStream.getAudioTracks()[0];
                  if (audioTrack) screenStream.addTrack(audioTrack);
                } catch { /* no audio */ }
              }
              stream = screenStream;
              screenStream.getVideoTracks()[0].onended = () => setIsSharingScreen(false);
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

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [isCameraOn, isMuted, isSharingScreen]);

  const handleToggleScreenShare = () => {
    if (isSharingScreen) setIsSharingScreen(false);
    else {
      setIsCameraOn(false);
      setIsSharingScreen(true);
    }
  };

  const router = useRouter();
  const handleExitRoom = () => router.push(window.location.href.split("/map")[0]);

  const handleLayoutUpdate = (newRooms: Room[], newObstacles: Obstacle[]) => {
    setRooms(newRooms);
    setObstacles(newObstacles);
    toast.success("Layout saved");
  };

  const getAvatarSrc = (key: string) => {
    if (key.startsWith("data:")) return key;
    return AVATAR_PRESETS[key] || AVATAR_PRESETS["preset_1"];
  };

  return (
    <div className="py-2 max-h-screen overflow-hidden flex flex-col items-center gap-4 relative bg-neutral-100">
      <canvas
        ref={canvasRef}
        width={viewPortSize.width}
        height={viewPortSize.height}
        className="border border-neutral-300 rounded bg-white"
      />

      {/* Current room HUD */}
      {currentRoom && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-full z-50 border border-neutral-700">
          {rooms.find((r) => r.roomId === currentRoom)?.name || "Room"}
        </div>
      )}

      {/* Top-left: avatar picker button */}
      <button
        onClick={() => setShowAvatarPicker(true)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 hover:bg-neutral-800 transition-colors"
        title="Change Avatar"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden border border-neutral-600">
          <img src={getAvatarSrc(currentAvatar)} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <span className="text-xs text-neutral-400">Avatar</span>
      </button>

      {/* Top-right: owner editor toggle */}
      {isOwner && (
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="fixed top-4 right-4 z-50 p-2 bg-neutral-900 text-white rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
          title="Edit Map"
        >
          <Settings size={16} />
        </button>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <AvatarPicker
          currentAvatar={currentAvatar}
          onSelect={(avatar) => setCurrentAvatar(avatar)}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      {/* Room Editor */}
      {showEditor && mapId && (
        <RoomEditor
          mapId={mapId}
          rooms={rooms}
          obstacles={obstacles}
          onUpdate={handleLayoutUpdate}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Remote video overlays */}
      {Object.entries(remoteStreams).map(([id, { stream, username, position }]) => (
        <PlayerVideoOverlay
          key={id}
          stream={stream}
          username={username}
          position={position}
          camera={camera}
          viewPortSize={viewPortSize}
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
      />
    </div>
  );
};

export default CanvaMap;