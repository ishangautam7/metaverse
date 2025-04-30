"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface AvatarCanvasProps {
  width: number;
  height: number;
  mapUID: number;
  username: string;
}

interface Player {
  username: string;
  position: { x: number; y: number };
}

interface PlayersMap {
  [socketId: string]: Player;
}

const socket: Socket = io("http://localhost:4000"); // Backend server URL

const CanvaMap = ({ username, mapUID, width = 1800, height = 1000 }: AvatarCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [position, setPosition] = useState({ x: width / 2, y: height / 2 });
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [viewPortSize, setViewPortSize] = useState({ width: 0, height: 0 });
  const [avatarSize] = useState(40);
  const [bgColor] = useState("#f0f0f0");
  const [obstacles] = useState([
    { x: 400, y: 300, w: 100, h: 100 },
    { x: 800, y: 600, w: 150, h: 100 },
  ]);
  const [players, setPlayers] = useState<PlayersMap>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<{ [id: string]: RTCPeerConnection }>({});


  // === WebRTC Functions ===
  const createPeerConnection = (socketId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local tracks
    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice", { to: socketId, candidate: event.candidate });
      }
    };

    // Remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const startCall = async (socketId: string) => {
    const pc = createPeerConnection(socketId);
    setPeerConnections((prev) => ({ ...prev, [socketId]: pc }));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("webrtc-offer", { to: socketId, offer });
  };

  // === Socket Events ===
  useEffect(() => {
    socket.emit("join", { mapUID, user: { username } });

    socket.on("playersUpdate", (players: PlayersMap) => {
      setPlayers(players);
    });

    socket.on("webrtc-offer", async ({ from, offer }) => {
      const pc = createPeerConnection(from);
      setPeerConnections((prev) => ({ ...prev, [from]: pc }));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc-offer", { to: from, answer });
    });

    socket.on("webrtc-answer", async ({ from, answer }) => {
      const pc = peerConnections[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("webrtc-ice", async ({ from, candidate }) => {
      const pc = peerConnections[from];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("playersUpdate");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
    };
  }, [localStream, peerConnections]);

  // Get local stream (mic + cam)
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access media devices", err);
      }
    };
    initMedia();
  }, []);

  // Emit own movement
  useEffect(() => {
    socket.emit("move", { mapUID, position });
  }, [position]);

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


  // Handle keyboard input
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
  }, [position, width, height, avatarSize]);

  useEffect(() => {
    const halfHeight = viewPortSize.height / 2;
    const halfWidth = viewPortSize.width / 2;

    setCamera({
      x: Math.min(Math.max(position.x - halfWidth, 0), width - viewPortSize.width),
      y: Math.min(Math.max(position.y - halfHeight, 0), height - viewPortSize.height),
    });
  }, [position, width, height, viewPortSize]);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, viewPortSize.width, viewPortSize.height);

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

    ctx.fillStyle = '#888';
    obstacles.forEach(({ x, y, w, h }) => {
      ctx.fillRect(x - camera.x, y - camera.y, w, h);
    });

    Object.entries(players).forEach(([id, player]) => {
      const isSelf = player.position.x === position.x && player.position.y === position.y;
      const drawX = player.position.x - camera.x;
      const drawY = player.position.y - camera.y;

      if (
        drawX + avatarSize < 0 || drawX > viewPortSize.width ||
        drawY + avatarSize < 0 || drawY > viewPortSize.height
      ) return;
      ctx.fillStyle = isSelf ? "#4CAF50" : "#2196F3";
      ctx.beginPath();
      ctx.arc(drawX + avatarSize / 2, drawY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(drawX + avatarSize / 3, drawY + avatarSize / 3, 5, 0, Math.PI * 2);
      ctx.arc(drawX + avatarSize * 2 / 3, drawY + avatarSize / 3, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(drawX + avatarSize / 2, drawY + avatarSize / 2, 10, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();

      ctx.fillStyle = "black";
      ctx.font = "14px Arial";
      ctx.fillText(player.username, drawX, drawY - 10);
    });
  }, [players, position, camera, avatarSize, bgColor, obstacles, viewPortSize, width, height]);
  return (
    <div className="py-2 overflow-hidden flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={viewPortSize.width}
        height={viewPortSize.height}
        className="border-4 border-indigo-500 rounded shadow-lg bg-white"
      />
      
      <div className="flex gap-4 mt-4">
        <div>
          <h2 className="text-lg font-bold">Your Video</h2>
          <video ref={localVideoRef} autoPlay muted playsInline className="border rounded-lg w-64 h-40" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Remote Video</h2>
          <video ref={remoteVideoRef} autoPlay playsInline className="border rounded-lg w-64 h-40" />
        </div>
      </div>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        onClick={() => {
          // start a call with the first other player
          const others = Object.keys(players).filter((id) => id !== socket.id);
          if (others.length > 0) {
            startCall(others[0]);
          } else {
            alert("No other players to call.");
          }
        }}
      >
        Start Call
      </button>
    </div>
  );
};

export default CanvaMap;
