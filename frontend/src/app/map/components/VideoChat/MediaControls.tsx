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
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-300 shadow-xl rounded-full px-4 py-2 flex gap-4 items-center">
            <button
                onClick={onToggleMute}
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                <MicrophoneIcon className={`h-5 w-5 ${isMuted ? 'text-red-500 opacity-50' : 'text-green-600'}`} />
                {isMuted && (
                    <XMarkIcon className="absolute top-0 right-0 h-3 w-3 text-red-600" />
                )}
            </button>

            <button
                onClick={onToggleCamera}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
                {isCameraOn ? (
                    <VideoCameraIcon className="h-5 w-5 text-green-600" />
                ) : (
                    <VideoCameraSlashIcon className="h-5 w-5 text-red-500" />
                )}
            </button>

            <button
                onClick={onToggleScreenShare}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title={isSharingScreen ? 'Stop sharing screen' : 'Share screen'}
            >
                {isSharingScreen ? (
                    <XMarkIcon className="h-5 w-5 text-red-500" />
                ) : (
                    <ComputerDesktopIcon className="h-5 w-5 text-blue-500" />
                )}
            </button>
        </div>
    );
};

export default MediaControls;