'use client';

import {
    MicrophoneIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
    ComputerDesktopIcon,
} from '@heroicons/react/24/solid';

interface MediaControlsProps {
    isMuted: boolean;
    isCameraOn: boolean;
    isSharingScreen: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
    handleExitRoom: () => void;
}

const MediaControls = ({
    isMuted,
    isCameraOn,
    isSharingScreen,
    onToggleMute,
    onToggleCamera,
    onToggleScreenShare,
    handleExitRoom
}: MediaControlsProps) => {
    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-neutral-900 border border-neutral-700 shadow-lg rounded-full px-4 py-2 flex gap-2 items-center">
            <button
                onClick={onToggleMute}
                className={`relative p-2.5 rounded-full transition-colors ${isMuted
                    ? 'bg-red-500/20 hover:bg-red-500/30'
                    : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                <MicrophoneIcon className={`h-5 w-5 ${isMuted ? 'text-red-400' : 'text-white'}`} />
                {isMuted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-0.5 bg-red-400 rotate-45"></div>
                    </div>
                )}
            </button>

            <button
                onClick={onToggleCamera}
                className={`p-2.5 rounded-full transition-colors ${isCameraOn
                    ? 'bg-neutral-800 hover:bg-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                disabled={isSharingScreen}
            >
                {isCameraOn ? (
                    <VideoCameraIcon className="h-5 w-5 text-white" />
                ) : (
                    <VideoCameraSlashIcon className="h-5 w-5 text-neutral-500" />
                )}
            </button>

            <button
                onClick={onToggleScreenShare}
                className={`p-2.5 rounded-full transition-colors ${isSharingScreen
                    ? 'bg-blue-500/20 hover:bg-blue-500/30'
                    : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                title={isSharingScreen ? 'Stop sharing screen' : 'Share screen'}
            >
                <ComputerDesktopIcon className={`h-5 w-5 ${isSharingScreen ? 'text-blue-400' : 'text-neutral-500'}`} />
            </button>

            <div className="w-px h-6 bg-neutral-700 mx-1" />

            <button
                onClick={handleExitRoom}
                className="p-2.5 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                title="Exit Room"
            >
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
    );
};

export default MediaControls;