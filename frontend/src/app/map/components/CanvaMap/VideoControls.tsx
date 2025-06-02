import { useState } from 'react';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface VideoControlsProps {
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export const VideoControls = ({
  onToggleVideo,
  onToggleAudio,
  isVideoEnabled,
  isAudioEnabled
}: VideoControlsProps) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 flex gap-2">
      <button
        onClick={onToggleVideo}
        className={`p-2 rounded-full ${isVideoEnabled ? 'bg-blue-100' : 'bg-red-100'}`}
      >
        {isVideoEnabled ? (
          <Video className="w-5 h-5 text-blue-600" />
        ) : (
          <VideoOff className="w-5 h-5 text-red-600" />
        )}
      </button>

      <button
        onClick={onToggleAudio}
        className={`p-2 rounded-full ${isAudioEnabled ? 'bg-blue-100' : 'bg-red-100'}`}
      >
        {isAudioEnabled ? (
          <Mic className="w-5 h-5 text-blue-600" />
        ) : (
          <MicOff className="w-5 h-5 text-red-600" />
        )}
      </button>
    </div>
  );
};