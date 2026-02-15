"use client";

import { LocalVideo } from "./LocalVideo";
import MediaControls from "./MediaControls";

interface VideoChatProps {
    localStream: MediaStream | null;
    isMuted: boolean;
    isCameraOn: boolean;
    isSharingScreen: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
    handleExitRoom: () => void;
    remoteStreams: {
        [key: string]: {
            stream: MediaStream;
            username: string;
            position: { x: number; y: number };
        }
    };
    isOwner?: boolean;
    editMode?: boolean;
    onToggleEditMode?: () => void;
}

export const VideoChat = ({
    localStream, isMuted, isCameraOn, isSharingScreen,
    onToggleMute, onToggleCamera, onToggleScreenShare,
    remoteStreams, handleExitRoom,
    isOwner, editMode, onToggleEditMode
}: VideoChatProps) => {
    return (
        <>
            <LocalVideo
                stream={localStream}
                isMuted={isMuted}
                isCameraOn={isCameraOn}
                isSharingScreen={isSharingScreen}
            />
            <MediaControls
                isMuted={isMuted}
                isCameraOn={isCameraOn}
                isSharingScreen={isSharingScreen}
                onToggleMute={onToggleMute}
                onToggleCamera={onToggleCamera}
                onToggleScreenShare={onToggleScreenShare}
                handleExitRoom={handleExitRoom}
                isOwner={isOwner}
                editMode={editMode}
                onToggleEditMode={onToggleEditMode}
            />
        </>
    );
};