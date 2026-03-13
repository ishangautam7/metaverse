import React from 'react';
import { AVATAR_PRESETS } from '../AvatarPicker/avatarPresets';

interface UserProfileModalProps {
  username: string;
  avatarKey: string;
  onClose: () => void;
  x: number;
  y: number;
}

export const UserProfileModal = ({ username, avatarKey, onClose, x, y }: UserProfileModalProps) => {
  // Placeholder badges 
  const badges = [
    { title: "Early Adopter", emoji: "🚀", color: "bg-purple-500" },
    { title: "Friendly", emoji: "👋", color: "bg-blue-500" },
    { title: "Chatterbox", emoji: "💬", color: "bg-green-500" },
  ];

  let avatarSrc = avatarKey;
  if (!avatarSrc.startsWith('data:')) {
    avatarSrc = AVATAR_PRESETS[avatarKey] || AVATAR_PRESETS['preset_1'];
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] cursor-default" 
        onClick={onClose}
      />
      <div 
        className="fixed z-50 bg-neutral-900 border border-neutral-700/50 rounded-xl shadow-2xl p-4 w-64 text-white animate-in zoom-in-95 duration-200"
        style={{ 
          left: Math.max(10, Math.min(window.innerWidth - 270, x)),
          top: Math.max(10, Math.min(window.innerHeight - 250, y))
        }}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <div className="flex flex-col items-center mt-2">
          <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-white/20 p-1 shadow-inner mb-3 flex items-center justify-center overflow-hidden">
             <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-bold truncate w-full text-center">{username}</h3>
          <p className="text-xs text-blue-400 font-medium tracking-wide">METAVERSE MEMBER</p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Badges</h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <div key={i} className={`flex items-center gap-1.5 ${b.color}/20 text-${b.color.replace('bg-', '')} border border-${b.color.replace('bg-', '')}/30 px-2 py-1 rounded-md text-xs font-medium`}>
                <span>{b.emoji}</span>
                <span>{b.title}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
           <button 
             className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-1.5 rounded-md text-xs font-semibold"
             onClick={() => {
                // Future: Send friend request
                onClose();
             }}
           >
             Add Friend
           </button>
        </div>
      </div>
    </>
  );
};
