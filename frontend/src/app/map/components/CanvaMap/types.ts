export interface Player {
    username: string;
    position: { x: number; y: number };
    currentRoom?: string | null;
    avatar?: string;
}

export interface PlayersMap {
    [socketId: string]: Player;
}

export interface Position {
    x: number;
    y: number;
}

export interface Camera {
    x: number;
    y: number;
}

export interface ViewPortSize {
    width: number;
    height: number;
}

export interface Obstacle {
    obstacleId?: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Room {
    roomId?: string;
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    locked: boolean;
    color: string;
}