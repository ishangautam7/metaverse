"use client";

import { useState, useRef } from "react";
import { AVATAR_PRESETS, PRESET_KEYS } from "./avatarPresets";
import axios from "axios";
import { host } from "@/utils/Routes";
import { X, Upload, Check } from "lucide-react";

interface AvatarPickerProps {
    currentAvatar: string;
    onSelect: (avatar: string) => void;
    onClose: () => void;
}

export const AvatarPicker = ({ currentAvatar, onSelect, onClose }: AvatarPickerProps) => {
    const [selected, setSelected] = useState(currentAvatar);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePresetClick = (key: string) => {
        setSelected(key);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024) {
            alert("Image too large. Max 100KB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setSelected(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${host}/api/auth/user/update-avatar`, { token, avatar: selected });

            // Update local storage
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            user.avatar = selected;
            localStorage.setItem("user", JSON.stringify(user));

            onSelect(selected);
            onClose();
        } catch (err) {
            console.error("Failed to save avatar:", err);
        }
        setSaving(false);
    };

    const getAvatarSrc = (key: string) => {
        if (key.startsWith("data:")) return key;
        return AVATAR_PRESETS[key] || AVATAR_PRESETS["preset_1"];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="bg-neutral-950 border border-neutral-800 rounded-xl w-[360px] p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Choose Avatar</h3>
                    <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400">
                        <X size={16} />
                    </button>
                </div>

                {/* Current preview */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                        <img src={getAvatarSrc(selected)} alt="Selected" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {PRESET_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => handlePresetClick(key)}
                            className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${selected === key ? "border-white" : "border-neutral-700 hover:border-neutral-500"
                                }`}
                        >
                            <img src={AVATAR_PRESETS[key]} alt={key} className="w-full h-full object-cover" />
                            {selected === key && (
                                <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                                    <Check size={16} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Upload custom */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors flex items-center justify-center gap-1.5 mb-4"
                >
                    <Upload size={14} />
                    Upload custom image
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                />

                {/* Custom preview if uploaded */}
                {selected.startsWith("data:") && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-600">
                            <img src={selected} alt="Custom" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-neutral-400">Custom image selected</span>
                    </div>
                )}

                {/* Save */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-2.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Avatar"}
                </button>
            </div>
        </div>
    );
};
