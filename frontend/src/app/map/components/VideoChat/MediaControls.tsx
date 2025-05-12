"use client"

import { Video, Mic, VideoOff, MicOff, Monitor, PhoneOff } from "lucide-react"

export const MediaControls = ({
  isCameraOn,
  setIsCameraOn,
  isMicOn,
  setIsMicOn,
  isScreenSharing,
  toggleScreenShare,
  handleLeave
}: {
  isCameraOn: boolean,
  setIsCameraOn: (val: boolean) => void,
  isMicOn: boolean,
  setIsMicOn: (val: boolean) => void,
  isScreenSharing: boolean,
  toggleScreenShare: () => void,
  handleLeave: () => void
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-2 flex gap-4 items-center z-50 border border-gray-200">
      <button onClick={() => setIsCameraOn(!isCameraOn)} className={`p-2 rounded-full transition-colors ${isCameraOn ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`} >
        {isCameraOn ? <Video className="text-green-600" /> : <VideoOff className="text-red-600" />}
      </button>

      <button onClick={() => setIsMicOn(!isMicOn)} className={`p-2 rounded-full transition-colors ${isMicOn ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}>
        {isMicOn ? <Mic className="text-green-600" /> : <MicOff className="text-red-600" />}
      </button>

      <button onClick={toggleScreenShare} className={`p-2 rounded-full ${isScreenSharing ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-blue-100 hover:bg-blue-200'} transition-colors`}>
        <Monitor className={isScreenSharing ? "text-yellow-600" : "text-blue-600"} />
      </button>

      <button onClick={handleLeave} className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors">
        <PhoneOff className="text-red-600" />
      </button>
    </div>
  );
};
