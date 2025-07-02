export interface Player {
    username: string;
    position: { x: number; y: number };
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
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Room {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    name: string;
}

export interface Furniture {
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    size?: number;
}

export interface Decoration {
    type: string;
    x: number;
    y: number;
    size?: number;
    w?: number;
    h?: number;
}