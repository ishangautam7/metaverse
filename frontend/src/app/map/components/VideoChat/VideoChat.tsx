"use client"

import { useState } from "react"
import { MediaControls } from "./MediaControls"

export const VideoChat = () => {
  const [isCameraOn, setIsCameraOn] = useState(true)

  return (
    <>
      <MediaControls />
      
      {isCameraOn && (
        <div className="absolute my-2 lg:right-6 top-2 min-h-40 min-w-64 bg-gray-200 shadow-md rounded">
          hi
        </div>
      )}
    </>
  )
}
