import { Room, Obstacle } from "@/app/map/components/CanvaMap/types";

export interface MapTemplate {
    id: string;
    name: string;
    description: string;
    width: number;
    height: number;
    rooms: Room[];
    obstacles: Obstacle[];
}

export const MAP_TEMPLATES: MapTemplate[] = [
    {
        id: "blank",
        name: "Blank Canvas",
        description: "An empty map. Add your own rooms and obstacles.",
        width: 1800,
        height: 1000,
        rooms: [],
        obstacles: [],
    },
    {
        id: "office",
        name: "Office Space",
        description: "A professional workspace with meeting rooms, a lounge, and open desks.",
        width: 1800,
        height: 1000,
        rooms: [
            { name: "Meeting Room", x: 60, y: 60, w: 280, h: 200, locked: false, color: "#1a1a2e" },
            { name: "Conference Hall", x: 400, y: 60, w: 380, h: 240, locked: false, color: "#1a1a2e" },
            { name: "Break Room", x: 60, y: 320, w: 220, h: 180, locked: false, color: "#2d2d3a" },
            { name: "Manager Office", x: 840, y: 60, w: 200, h: 180, locked: true, color: "#1a1a2e" },
            { name: "Lounge", x: 400, y: 380, w: 300, h: 180, locked: false, color: "#2d2d3a" },
            { name: "Server Room", x: 840, y: 300, w: 180, h: 140, locked: true, color: "#0d0d1a" },
        ],
        obstacles: [
            // Meeting room table
            { x: 120, y: 130, w: 160, h: 60 },
            // Conference table
            { x: 480, y: 140, w: 220, h: 80 },
            // Break room counter
            { x: 80, y: 340, w: 180, h: 30 },
            // Desks in open area
            { x: 400, y: 620, w: 80, h: 50 },
            { x: 520, y: 620, w: 80, h: 50 },
            { x: 640, y: 620, w: 80, h: 50 },
            { x: 760, y: 620, w: 80, h: 50 },
            // Manager desk
            { x: 880, y: 110, w: 120, h: 50 },
            // Server rack
            { x: 870, y: 330, w: 120, h: 80 },
        ],
    },
    {
        id: "classroom",
        name: "Classroom",
        description: "A teaching space with a lecture area, group tables, and a study corner.",
        width: 1800,
        height: 1000,
        rooms: [
            { name: "Lecture Hall", x: 60, y: 60, w: 500, h: 350, locked: false, color: "#1a2e1a" },
            { name: "Study Room A", x: 620, y: 60, w: 220, h: 180, locked: false, color: "#1a1a2e" },
            { name: "Study Room B", x: 620, y: 300, w: 220, h: 180, locked: false, color: "#1a1a2e" },
            { name: "Library", x: 60, y: 480, w: 340, h: 220, locked: false, color: "#2e2e1a" },
            { name: "Teachers Lounge", x: 900, y: 60, w: 240, h: 200, locked: true, color: "#2d2d3a" },
        ],
        obstacles: [
            // Lecture podium
            { x: 260, y: 80, w: 80, h: 40 },
            // Student desks (rows)
            { x: 100, y: 180, w: 120, h: 30 },
            { x: 260, y: 180, w: 120, h: 30 },
            { x: 420, y: 180, w: 120, h: 30 },
            { x: 100, y: 250, w: 120, h: 30 },
            { x: 260, y: 250, w: 120, h: 30 },
            { x: 420, y: 250, w: 120, h: 30 },
            { x: 100, y: 320, w: 120, h: 30 },
            { x: 260, y: 320, w: 120, h: 30 },
            { x: 420, y: 320, w: 120, h: 30 },
            // Study tables
            { x: 660, y: 120, w: 140, h: 60 },
            { x: 660, y: 360, w: 140, h: 60 },
            // Library shelves
            { x: 80, y: 500, w: 30, h: 180 },
            { x: 140, y: 500, w: 30, h: 180 },
            { x: 200, y: 500, w: 30, h: 180 },
        ],
    },
    {
        id: "lounge",
        name: "Social Lounge",
        description: "A casual hangout with a game zone, cafe area, and chill corners.",
        width: 1800,
        height: 1000,
        rooms: [
            { name: "Cafe", x: 60, y: 60, w: 300, h: 220, locked: false, color: "#2e1a1a" },
            { name: "Game Zone", x: 420, y: 60, w: 320, h: 280, locked: false, color: "#1a1a2e" },
            { name: "Chill Corner", x: 60, y: 340, w: 250, h: 200, locked: false, color: "#2d2d3a" },
            { name: "Music Room", x: 800, y: 60, w: 240, h: 200, locked: false, color: "#2e2e1a" },
            { name: "VIP Lounge", x: 800, y: 320, w: 240, h: 200, locked: true, color: "#1a1a1a" },
        ],
        obstacles: [
            // Cafe tables
            { x: 100, y: 120, w: 60, h: 40 },
            { x: 200, y: 120, w: 60, h: 40 },
            { x: 100, y: 200, w: 60, h: 40 },
            { x: 200, y: 200, w: 60, h: 40 },
            // Cafe counter
            { x: 80, y: 250, w: 240, h: 20 },
            // Game tables
            { x: 480, y: 120, w: 80, h: 80 },
            { x: 600, y: 120, w: 80, h: 80 },
            { x: 480, y: 240, w: 80, h: 80 },
            // Chill sofas
            { x: 80, y: 380, w: 100, h: 40 },
            { x: 80, y: 460, w: 100, h: 40 },
            // Music stage
            { x: 840, y: 80, w: 160, h: 30 },
            // VIP table
            { x: 880, y: 400, w: 100, h: 60 },
        ],
    },
];
