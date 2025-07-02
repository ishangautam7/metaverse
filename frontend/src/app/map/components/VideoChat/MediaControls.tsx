'use client';

import {
    MicrophoneIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
    ComputerDesktopIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';

interface MediaControlsProps {
    isMuted: boolean;
    isCameraOn: boolean;
    isSharingScreen: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
}

const MediaControls = ({
    isMuted,
    isCameraOn,
    isSharingScreen,
    onToggleMute,
    onToggleCamera,
    onToggleScreenShare
}: MediaControlsProps) => {
    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm border border-gray-300 shadow-xl rounded-full px-6 py-3 flex gap-4 items-center">
            {/* Microphone Control */}
            <button
                onClick={onToggleMute}
                className={`relative p-3 rounded-full transition-all duration-200 ${
                    isMuted 
                        ? 'bg-red-100 hover:bg-red-200' 
                        : 'bg-green-100 hover:bg-green-200'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                <MicrophoneIcon className={`h-6 w-6 ${isMuted ? 'text-red-600' : 'text-green-600'}`} />
                {isMuted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-0.5 bg-red-600 rotate-45"></div>
                    </div>
                )}
            </button>

            {/* Camera Control */}
            <button
                onClick={onToggleCamera}
                className={`p-3 rounded-full transition-all duration-200 ${
                    isCameraOn 
                        ? 'bg-green-100 hover:bg-green-200' 
                        : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                disabled={isSharingScreen}
            >
                {isCameraOn ? (
                    <VideoCameraIcon className="h-6 w-6 text-green-600" />
                ) : (
                    <VideoCameraSlashIcon className="h-6 w-6 text-gray-600" />
                )}
            </button>

            {/* Screen Share Control */}
            <button
                onClick={onToggleScreenShare}
                className={`p-3 rounded-full transition-all duration-200 ${
                    isSharingScreen 
                        ? 'bg-blue-100 hover:bg-blue-200' 
                        : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={isSharingScreen ? 'Stop sharing screen' : 'Share screen'}
            >
                {isSharingScreen ? (
                    <div className="relative">
                        <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                ) : (
                    <ComputerDesktopIcon className="h-6 w-6 text-gray-600" />
                )}
            </button>
        </div>
    );
};

export default MediaControls;