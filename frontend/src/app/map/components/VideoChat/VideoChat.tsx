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
    remoteStreams: { [key:string]:{
        stream: MediaStream;
        username: string;
        position:{
            x: number;
            y: number;
        }
    }}
}

export const VideoChat = ({ 
    localStream, 
    isMuted, 
    isCameraOn, 
    isSharingScreen, 
    onToggleMute, 
    onToggleCamera, 
    onToggleScreenShare, 
    remoteStreams 
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
            />
        </>
    );
};