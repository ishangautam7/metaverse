"use client";

import { useState } from "react";
import { Room, Decoration, DecorationType } from "../CanvaMap/types";
import { AvatarPicker } from "../AvatarPicker/AvatarPicker";
import { AVATAR_PRESETS } from "../AvatarPicker/avatarPresets";
import axios from "axios";
import { updateLayoutRoute } from "@/utils/Routes";
import { Plus, Trash2, Lock, Unlock, Save, X, DoorOpen, Shapes, User } from "lucide-react";

interface RoomEditorProps {
    mapId: string;
    rooms: Room[];
    decorations: Decoration[];
    currentAvatar: string;
    onUpdate: (rooms: Room[], decorations: Decoration[]) => void;
    onAvatarChange: (avatar: string) => void;
    onClose: () => void;
}

const DECORATION_TYPES: { type: DecorationType; label: string; emoji: string }[] = [
    { type: "table", label: "Table", emoji: "🪑" },
    { type: "plant", label: "Plant", emoji: "🌱" },
    { type: "bookshelf", label: "Bookshelf", emoji: "📚" },
    { type: "sofa", label: "Sofa", emoji: "🛋️" },
    { type: "desk", label: "Desk", emoji: "🖥️" },
    { type: "divider", label: "Divider", emoji: "▎" },
    { type: "lamp", label: "Lamp", emoji: "💡" },
    { type: "generic", label: "Block", emoji: "⬜" },
];

export const RoomEditor = ({ mapId, rooms, decorations, currentAvatar, onUpdate, onAvatarChange, onClose }: RoomEditorProps) => {
    const [localRooms, setLocalRooms] = useState<Room[]>(rooms);
    const [localDecorations, setLocalDecorations] = useState<Decoration[]>(decorations);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<"rooms" | "decorations" | "avatar">("rooms");
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    const addRoom = () => {
        setLocalRooms([...localRooms, {
            name: `Room ${localRooms.length + 1}`,
            x: 100, y: 100, w: 200, h: 150,
            locked: false, color: "#3b82f6"
        }]);
    };

    const addDecoration = (type: DecorationType) => {
        const defaults: Record<string, { w: number; h: number }> = {
            table: { w: 80, h: 50 },
            plant: { w: 30, h: 30 },
            bookshelf: { w: 30, h: 80 },
            sofa: { w: 100, h: 40 },
            desk: { w: 80, h: 50 },
            divider: { w: 10, h: 100 },
            lamp: { w: 20, h: 20 },
            generic: { w: 60, h: 60 },
        };
        const size = defaults[type] || { w: 60, h: 60 };
        setLocalDecorations([...localDecorations, {
            type,
            x: 100, y: 100,
            ...size
        }]);
    };

    const updateRoom = (i: number, field: string, value: string | number | boolean) => {
        const updated = [...localRooms];
        (updated[i] as any)[field] = value;
        setLocalRooms(updated);
    };

    const removeRoom = (i: number) => setLocalRooms(localRooms.filter((_, idx) => idx !== i));

    const updateDecoration = (i: number, field: string, value: string | number) => {
        const updated = [...localDecorations];
        (updated[i] as any)[field] = value;
        setLocalDecorations(updated);
    };

    const removeDecoration = (i: number) => setLocalDecorations(localDecorations.filter((_, idx) => idx !== i));

    const save = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(updateLayoutRoute, {
                token, mapId,
                rooms: localRooms,
                decorations: localDecorations
            });
            onUpdate(localRooms, localDecorations);
        } catch (err) {
            console.error("Failed to save layout:", err);
        }
        setSaving(false);
    };

    const getAvatarSrc = (key: string) => {
        if (key.startsWith("data:")) return key;
        return AVATAR_PRESETS[key] || AVATAR_PRESETS["preset_1"];
    };

    return (
        <>
            <div className="fixed top-0 right-0 w-80 h-full bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col text-white">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <h2 className="text-sm font-semibold">Settings</h2>
                    <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800">
                    {[
                        { key: "rooms" as const, icon: <DoorOpen size={13} />, label: `Rooms (${localRooms.length})` },
                        { key: "decorations" as const, icon: <Shapes size={13} />, label: `Decor (${localDecorations.length})` },
                        { key: "avatar" as const, icon: <User size={13} />, label: "Avatar" },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 py-2.5 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors ${tab === t.key ? "text-white border-b border-white" : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {tab === "rooms" && (
                        <>
                            {localRooms.map((room, i) => (
                                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <input
                                            value={room.name}
                                            onChange={(e) => updateRoom(i, "name", e.target.value)}
                                            className="bg-transparent text-xs font-medium text-white outline-none flex-1 min-w-0"
                                            placeholder="Room name"
                                        />
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => updateRoom(i, "locked", !room.locked)}
                                                className={`p-1 rounded transition-colors ${room.locked ? "text-red-400" : "text-neutral-500"}`}
                                            >
                                                {room.locked ? <Lock size={12} /> : <Unlock size={12} />}
                                            </button>
                                            <button onClick={() => removeRoom(i)} className="p-1 text-neutral-500 hover:text-red-400 rounded transition-colors">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {(["x", "y", "w", "h"] as const).map(f => (
                                            <div key={f}>
                                                <label className="text-[9px] text-neutral-600 uppercase">{f}</label>
                                                <input
                                                    type="number"
                                                    value={(room as any)[f]}
                                                    onChange={(e) => updateRoom(i, f, Number(e.target.value))}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1 text-[11px] text-white outline-none focus:border-neutral-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {room.locked && (
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                value={(room as any).passcode || ""}
                                                onChange={(e) => updateRoom(i, "passcode", e.target.value)}
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-red-400"
                                                placeholder="Set a passcode (optional)"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button onClick={addRoom}
                                className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-xs text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors flex items-center justify-center gap-1.5">
                                <Plus size={14} /> Add Room
                            </button>
                        </>
                    )}

                    {tab === "decorations" && (
                        <>
                            {/* Quick-add decoration types */}
                            <div className="grid grid-cols-4 gap-1.5 mb-2">
                                {DECORATION_TYPES.map(dt => (
                                    <button key={dt.type}
                                        onClick={() => addDecoration(dt.type)}
                                        className="flex flex-col items-center gap-0.5 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                                    >
                                        <span className="text-sm">{dt.emoji}</span>
                                        {dt.label}
                                    </button>
                                ))}
                            </div>

                            {localDecorations.map((dec, i) => (
                                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-neutral-400">
                                            {DECORATION_TYPES.find(d => d.type === dec.type)?.emoji} {DECORATION_TYPES.find(d => d.type === dec.type)?.label || dec.type}
                                        </span>
                                        <button onClick={() => removeDecoration(i)} className="p-1 text-neutral-500 hover:text-red-400 rounded transition-colors">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {(["x", "y", "w", "h"] as const).map(f => (
                                            <div key={f}>
                                                <label className="text-[9px] text-neutral-600 uppercase">{f}</label>
                                                <input
                                                    type="number"
                                                    value={(dec as any)[f]}
                                                    onChange={(e) => updateDecoration(i, f, Number(e.target.value))}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1 text-[11px] text-white outline-none focus:border-neutral-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {tab === "avatar" && (
                        <div className="space-y-3">
                            <div className="flex flex-col items-center gap-3 py-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                                    <img src={getAvatarSrc(currentAvatar)} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <button onClick={() => setShowAvatarPicker(true)}
                                    className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white hover:bg-neutral-700 transition-colors">
                                    Change Avatar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer — Save */}
                <div className="p-3 border-t border-neutral-800">
                    <button onClick={save} disabled={saving}
                        className="w-full py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <Save size={14} />
                        {saving ? "Saving..." : "Save Layout"}
                    </button>
                </div>
            </div>

            {showAvatarPicker && (
                <AvatarPicker
                    currentAvatar={currentAvatar}
                    onSelect={onAvatarChange}
                    onClose={() => setShowAvatarPicker(false)}
                />
            )}
        </>
    );
};
