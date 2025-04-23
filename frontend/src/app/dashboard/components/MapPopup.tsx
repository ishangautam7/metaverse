"use client"
import { useState, useRef, useEffect } from "react"

type MapFormData = {
  name: string
  width: number
  height: number
}

interface PopupFormProps {
  onSubmit: (data: MapFormData) => void
  onClose: () => void
}

export default function PopupForm({ onSubmit, onClose }: PopupFormProps) {
  const [name, setName] = useState("")
  const [width, setWidth] = useState(1280)
  const [height, setHeight] = useState(720)

  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clampedWidth = Math.min(Math.max(width, 1280), 1920)
    const clampedHeight = Math.min(Math.max(height, 720), 1080)
    onSubmit({ name, width: clampedWidth, height: clampedHeight })
  }

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-[90%] max-w-md text-white relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-xl font-bold text-gray-300 hover:text-white transition">×</button>

        <h2 className="text-2xl font-semibold mb-6 text-center">📐 Create Canvas</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-gray-300">Name</label>
            <input id="name" type="text" placeholder="Enter map name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-white/50 transition"/>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="width" className="text-sm text-gray-300">Width (1280–1920)</label>
            <input id="width" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} min={1280} max={1920} required className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-white/50 transition"/>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="height" className="text-sm text-gray-300">Height (720–1080)</label>
            <input id="height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} min={720} max={1080} required className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-white/50 transition"/>
          </div>

          <button type="submit" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl font-semibold transition">🚀 Create </button>
        </form>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
