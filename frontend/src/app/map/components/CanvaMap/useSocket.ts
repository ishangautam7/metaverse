import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { PlayersMap } from "./types";
import { socket } from "../../lib/socket";

interface UseSocketProps {
  mapUID: number;
  username: string;
  position: { x: number; y: number };
  localStream: MediaStream | null;
}

export const useSocket = ({ mapUID, username, position, localStream }: UseSocketProps) => {
  const [players, setPlayers] = useState<PlayersMap>({});
  const [peerConnections, setPeerConnections] = useState<{ [id: string]: RTCPeerConnection }>({});

  useEffect(() => {
    socket.emit("join", { mapUID, user: { username } });

    socket.on("playersUpdate", (players: PlayersMap) => {
      setPlayers(players);
    });
    return () => {
      socket.off("playersUpdate");
    };
  }, [localStream, peerConnections]);

  useEffect(() => {
    socket.emit("move", { mapUID, position });
  }, [position]);

  return { players };
};