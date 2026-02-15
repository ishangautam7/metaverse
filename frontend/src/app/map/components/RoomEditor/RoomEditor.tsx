"use client";

import { useState } from "react";
import { Room, Obstacle } from "../CanvaMap/types";
import axios from "axios";
import { updateLayoutRoute } from "@/utils/Routes";
import { Plus, Trash2, Lock, Unlock, Save, X, Square, DoorOpen } from "lucide-react";

interface RoomEditorProps {
    mapId: string;
    rooms: Room[];
    obstacles: Obstacle[];
    onUpdate: (rooms: Room[], obstacles: Obstacle[]) => void;
    onClose: () => void;
}

export const RoomEditor = ({ mapId, rooms, obstacles, onUpdate, onClose }: RoomEditorProps) => {
    const [localRooms, setLocalRooms] = useState<Room[]>(rooms);
    const [localObstacles, setLocalObstacles] = useState<Obstacle[]>(obstacles);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<"rooms" | "obstacles">("rooms");

    const addRoom = () => {
        setLocalRooms([...localRooms, {
            name: `Room ${localRooms.length + 1}`,
            x: 100,
            y: 100,
            w: 200,
            h: 150,
            locked: false,
            color: "#1a1a2e"
        }]);
    };

    const addObstacle = () => {
        setLocalObstacles([...localObstacles, {
            x: 100,
            y: 100,
            w: 60,
            h: 60
        }]);
    };

    const updateRoom = (index: number, field: string, value: string | number | boolean) => {
        const updated = [...localRooms];
        (updated[index] as any)[field] = value;
        setLocalRooms(updated);
    };

    const removeRoom = (index: number) => {
        setLocalRooms(localRooms.filter((_, i) => i !== index));
    };

    const updateObstacle = (index: number, field: string, value: number) => {
        const updated = [...localObstacles];
        (updated[index] as any)[field] = value;
        setLocalObstacles(updated);
    };

    const removeObstacle = (index: number) => {
        setLocalObstacles(localObstacles.filter((_, i) => i !== index));
    };

    const save = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(updateLayoutRoute, {
                token,
                mapId,
                rooms: localRooms,
                obstacles: localObstacles
            });
            onUpdate(localRooms, localObstacles);
        } catch (err) {
            console.error("Failed to save layout:", err);
        }
        setSaving(false);
    };

    return (
        <div className="fixed top-0 right-0 w-80 h-full bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h2 className="text-sm font-semibold">Map Editor</h2>
                <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded transition-colors">
                    <X size={16} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-800">
                <button
                    onClick={() => setTab("rooms")}
                    className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${tab === "rooms" ? "text-white border-b border-white" : "text-neutral-500 hover:text-neutral-300"
                        }`}
                >
                    <DoorOpen size={14} />
                    Rooms ({localRooms.length})
                </button>
                <button
                    onClick={() => setTab("obstacles")}
                    className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${tab === "obstacles" ? "text-white border-b border-white" : "text-neutral-500 hover:text-neutral-300"
                        }`}
                >
                    <Square size={14} />
                    Obstacles ({localObstacles.length})
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {tab === "rooms" && (
                    <>
                        {localRooms.map((room, i) => (
                            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <input
                                        value={room.name}
                                        onChange={(e) => updateRoom(i, "name", e.target.value)}
                                        className="bg-transparent text-sm font-medium text-white outline-none flex-1"
                                        placeholder="Room name"
                                    />
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateRoom(i, "locked", !room.locked)}
                                            className={`p-1 rounded transition-colors ${room.locked ? "text-red-400 hover:bg-red-500/10" : "text-neutral-500 hover:bg-neutral-800"}`}
                                            title={room.locked ? "Unlock" : "Lock"}
                                        >
                                            {room.locked ? <Lock size={14} /> : <Unlock size={14} />}
                                        </button>
                                        <button onClick={() => removeRoom(i)} className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {(["x", "y", "w", "h"] as const).map(f => (
                                        <div key={f}>
                                            <label className="text-[10px] text-neutral-600 uppercase">{f}</label>
                                            <input
                                                type="number"
                                                value={(room as any)[f]}
                                                onChange={(e) => updateRoom(i, f, Number(e.target.value))}
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addRoom}
                            className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-xs text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Plus size={14} /> Add Room
                        </button>
                    </>
                )}

                {tab === "obstacles" && (
                    <>
                        {localObstacles.map((obs, i) => (
                            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-400">Obstacle {i + 1}</span>
                                    <button onClick={() => removeObstacle(i)} className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {(["x", "y", "w", "h"] as const).map(f => (
                                        <div key={f}>
                                            <label className="text-[10px] text-neutral-600 uppercase">{f}</label>
                                            <input
                                                type="number"
                                                value={(obs as any)[f]}
                                                onChange={(e) => updateObstacle(i, f, Number(e.target.value))}
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addObstacle}
                            className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-xs text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Plus size={14} /> Add Obstacle
                        </button>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-neutral-800">
                <button
                    onClick={save}
                    disabled={saving}
                    className="w-full py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save Layout"}
                </button>
            </div>
        </div>
    );
};
