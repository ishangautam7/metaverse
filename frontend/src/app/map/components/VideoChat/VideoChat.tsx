// components/VideoChat/VideoChat.tsx
"use client";

import { LocalVideo } from "./LocalVideo";
import { RemoteVideo } from "./RemoteVideo";
import MediaControls from "./MediaControls";
interface VideoChatProps {
    localStream: MediaStream | null;
    isMuted: boolean;
    isCameraOn: boolean;
    isSharingScreen: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
}

export const VideoChat = ({localStream, isMuted, isCameraOn, isSharingScreen, onToggleMute, onToggleCamera, onToggleScreenShare}: VideoChatProps) => {
    return (
        <>
            <div className="flex gap-4">
                <LocalVideo
                    stream={localStream}
                    isMuted={isMuted}
                    isCameraOn={isCameraOn}
                    isSharingScreen={isSharingScreen}
                    onToggleMute={onToggleMute}
                    onToggleCamera={onToggleCamera}
                    onToggleScreenShare={onToggleScreenShare}
                />
                <RemoteVideo />
            </div>

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