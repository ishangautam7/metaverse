import { Room, Decoration } from "@/app/map/components/CanvaMap/types";

export interface MapTemplate {
    id: string;
    name: string;
    description: string;
    width: number;
    height: number;
    rooms: Room[];
    decorations: Decoration[];
}

export const MAP_TEMPLATES: MapTemplate[] = [
    {
        id: "blank",
        name: "Blank Canvas",
        description: "An empty map. Add your own rooms and decorations.",
        width: 1800,
        height: 1000,
        rooms: [],
        decorations: [],
    },
    {
        id: "office",
        name: "Office Space",
        description: "Meeting rooms, a lounge, and open desks.",
        width: 1800,
        height: 1000,
        rooms: [
            { name: "Meeting Room", x: 60, y: 60, w: 280, h: 200, locked: false, color: "#3b82f6" },
            { name: "Conference Hall", x: 400, y: 60, w: 380, h: 240, locked: false, color: "#6366f1" },
            { name: "Break Room", x: 60, y: 320, w: 220, h: 180, locked: false, color: "#22c55e" },
            { name: "Manager Office", x: 840, y: 60, w: 200, h: 180, locked: true, color: "#f97316" },
            { name: "Lounge", x: 400, y: 380, w: 300, h: 180, locked: false, color: "#a855f7" },
            { name: "Server Room", x: 840, y: 300, w: 180, h: 140, locked: true, color: "#ef4444" },
        ],
        decorations: [
            { type: "table", x: 120, y: 130, w: 160, h: 60 },
            { type: "table", x: 480, y: 140, w: 220, h: 80 },
            { type: "desk", x: 80, y: 340, w: 180, h: 30 },
            { type: "desk", x: 400, y: 620, w: 80, h: 50 },
            { type: "desk", x: 520, y: 620, w: 80, h: 50 },
            { type: "desk", x: 640, y: 620, w: 80, h: 50 },
            { type: "desk", x: 760, y: 620, w: 80, h: 50 },
            { type: "desk", x: 880, y: 110, w: 120, h: 50 },
            { type: "generic", x: 870, y: 330, w: 120, h: 80 },
        ],
    },
    {
        id: "classroom",
        name: "Classroom",
        description: "Lecture area, study rooms, and library.",
        width: 1800,
        height: 1000,
        rooms: [
            { name: "Lecture Hall", x: 60, y: 60, w: 500, h: 350, locked: false, color: "#22c55e" },
            { name: "Study Room A", x: 620, y: 60, w: 220, h: 180, locked: false, color: "#3b82f6" },
            { name: "Study Room B", x: 620, y: 300, w: 220, h: 180, locked: false, color: "#6366f1" },
            { name: "Library", x: 60, y: 480, w: 340, h: 220, locked: false, color: "#eab308" },
            { name: "Teachers Lounge", x: 900, y: 60, w: 240, h: 200, locked: true, color: "#ef4444" },
        ],
        decorations: [
            { type: "desk", x: 260, y: 80, w: 80, h: 40 },
            { type: "table", x: 100, y: 180, w: 120, h: 30 },
            { type: "table", x: 260, y: 180, w: 120, h: 30 },
            { type: "table", x: 420, y: 180, w: 120, h: 30 },
            { type: "table", x: 100, y: 250, w: 120, h: 30 },
            { type: "table", x: 260, y: 250, w: 120, h: 30 },
            { type: "table", x: 420, y: 250, w: 120, h: 30 },
            { type: "table", x: 100, y: 320, w: 120, h: 30 },
            { type: "table", x: 260, y: 320, w: 120, h: 30 },
            { type: "table", x: 420, y: 320, w: 120, h: 30 },
            { type: "table", x: 660, y: 120, w: 140, h: 60 },
            { type: "table", x: 660, y: 360, w: 140, h: 60 },
            { type: "bookshelf", x: 80, y: 500, w: 30, h: 180 },
            { type: "bookshelf", x: 140, y: 500, w: 30, h: 180 },
            { type: "bookshelf", x: 200, y: 500, w: 30, h: 180 },
        ],
    },
    {
        id: "lounge",
        name: "Social Lounge",
        description: "Cafe, game zone, chill corners, and VIP.",
        width: 1800,
        height: 1000,
        rooms: [
            { name: "Cafe", x: 60, y: 60, w: 300, h: 220, locked: false, color: "#f97316" },
            { name: "Game Zone", x: 420, y: 60, w: 320, h: 280, locked: false, color: "#3b82f6" },
            { name: "Chill Corner", x: 60, y: 340, w: 250, h: 200, locked: false, color: "#a855f7" },
            { name: "Music Room", x: 800, y: 60, w: 240, h: 200, locked: false, color: "#22c55e" },
            { name: "VIP Lounge", x: 800, y: 320, w: 240, h: 200, locked: true, color: "#eab308" },
        ],
        decorations: [
            { type: "table", x: 100, y: 120, w: 60, h: 40 },
            { type: "table", x: 200, y: 120, w: 60, h: 40 },
            { type: "table", x: 100, y: 200, w: 60, h: 40 },
            { type: "table", x: 200, y: 200, w: 60, h: 40 },
            { type: "desk", x: 80, y: 250, w: 240, h: 20 },
            { type: "table", x: 480, y: 120, w: 80, h: 80 },
            { type: "table", x: 600, y: 120, w: 80, h: 80 },
            { type: "table", x: 480, y: 240, w: 80, h: 80 },
            { type: "sofa", x: 80, y: 380, w: 100, h: 40 },
            { type: "sofa", x: 80, y: 460, w: 100, h: 40 },
            { type: "generic", x: 840, y: 80, w: 160, h: 30 },
            { type: "table", x: 880, y: 400, w: 100, h: 60 },
        ],
    },
];
