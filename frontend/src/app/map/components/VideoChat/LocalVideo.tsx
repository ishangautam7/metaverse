"use client";

import { useRef, useEffect } from "react";

interface LocalVideoProps {
    stream: MediaStream | null;
    isMuted: boolean;
    isCameraOn: boolean;
    isSharingScreen: boolean;
}

export const LocalVideo = ({ stream, isMuted, isCameraOn, isSharingScreen }: LocalVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (stream && (isCameraOn || isSharingScreen)) {
            video.srcObject = stream;
            video.muted = true; // Always mute local video to prevent feedback
        } else {
            video.srcObject = null;
        }

        return () => {
            if (video.srcObject) {
                video.srcObject = null;
            }
        };
    }, [stream, isCameraOn, isSharingScreen]);

    if (!stream || (!isCameraOn && !isSharingScreen)) {
        return (
            <div className="fixed bottom-20 right-5 w-48 h-36 bg-gray-800 rounded-lg border-2 border-green-500 shadow-md flex items-center justify-center z-50">
                <div className="text-white text-center">
                    <div className="text-2xl mb-2">📹</div>
                    <div className="text-sm">Camera Off</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-20 right-5 w-48 h-36 z-50">
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full rounded-lg border-2 border-green-500 shadow-md bg-black object-cover"
            />
            <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-center py-1 text-xs rounded">
                You {isSharingScreen ? "(Screen)" : ""}
            </div>
        </div>
    );
};