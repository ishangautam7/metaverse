"use client";

import { useRef, useEffect } from "react";

interface LocalVideoProps {
    stream: MediaStream | null;
    isMuted: boolean;
    isCameraOn: boolean;
    isSharingScreen: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
}

export const  LocalVideo = ({ stream, isMuted, isCameraOn, isSharingScreen, onToggleMute, onToggleCamera, onToggleScreenShare }: LocalVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current
        if(!video || !stream) return;
        video.srcObject = stream
        video.muted = isMuted
        stream.getVideoTracks().forEach(track => {
            track.enabled = isCameraOn
        })

        return()=>{
            video.srcObject = null
        }
    }, [stream, isCameraOn]);

    return (
        <div className="fixed w-32 h-24 top-5 lg:top-[unset] lg:fixed lg:bottom-3.5 lg:left-5 lg:h-40 lg:w-55 z-50 ">
            <video ref={videoRef} autoPlay muted={isMuted} className={`w-full h-full rounded-lg border-2 border-green-500 shadow-md bg-black ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
};