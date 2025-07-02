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
    <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div ref={popupRef} className="relative bg-black/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 w-[90%] max-w-md text-white animate-fadeIn">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-30"></div>
        
        <div className="relative z-10">
          <button 
            onClick={onClose} 
            className="absolute top-0 right-0 text-xl font-bold text-gray-300 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          >
            ×
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80 mb-4">
              <span> Create</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              New Virtual Space
            </h2>
            <p className="text-gray-400 mt-2">Design your perfect collaboration environment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <span></span> Space Name
              </label>
              <input 
                id="name" 
                type="text" 
                placeholder="Enter a creative name..." 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="width" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span>↔️</span> Width
                </label>
                <input 
                  id="width" 
                  type="number" 
                  value={width} 
                  onChange={(e) => setWidth(Number(e.target.value))} 
                  min={1280} 
                  max={1920} 
                  required 
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
                <p className="text-xs text-gray-500">1280-1920px</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="height" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span>↕️</span> Height
                </label>
                <input 
                  id="height" 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))} 
                  min={720} 
                  max={1080} 
                  required 
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
                <p className="text-xs text-gray-500">720-1080px</p>
              </div>
            </div>

            <button 
              type="submit" 
              className="group w-full mt-8 bg-gradient-to-r from-purple-600 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Create Space
              </span>
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}