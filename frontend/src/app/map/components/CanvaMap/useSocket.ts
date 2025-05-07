import { useEffect, useState } from "react";
import { PlayersMap } from "./types";
import { socket } from "../../lib/socket";

interface UseSocketProps {
  mapUID: number;
  username: string;
  position: { x: number; y: number };
}

export const useSocket = ({ mapUID, username, position }: UseSocketProps) => {
  const [players, setPlayers] = useState<PlayersMap>({});

  useEffect(() => {
    socket.emit("join", { mapUID, user: { username } });

    socket.on("playersUpdate", (players: PlayersMap) => {
      setPlayers(players);
    });

    return () => {
      socket.off("playersUpdate");
    };
  }, []);

  useEffect(() => {
    socket.emit("move", { mapUID, position });
  }, [position]);

  return { players };
};