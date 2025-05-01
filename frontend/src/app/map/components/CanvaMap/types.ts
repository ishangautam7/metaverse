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