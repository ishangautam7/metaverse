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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg w-[90%] max-w-sm text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          ×
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">New space</h2>
          <p className="text-neutral-500 text-sm">Configure your virtual room</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium text-neutral-400">Name</label>
            <input
              id="name"
              type="text"
              placeholder="My workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2.5 text-sm outline-none focus:border-neutral-600 transition-colors placeholder-neutral-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="width" className="text-xs font-medium text-neutral-400">Width</label>
              <input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={1280}
                max={1920}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2.5 text-sm outline-none focus:border-neutral-600 transition-colors"
              />
              <p className="text-xs text-neutral-600">1280–1920px</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="height" className="text-xs font-medium text-neutral-400">Height</label>
              <input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={720}
                max={1080}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2.5 text-sm outline-none focus:border-neutral-600 transition-colors"
              />
              <p className="text-xs text-neutral-600">720–1080px</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-700 text-white text-sm rounded-md hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-md hover:bg-neutral-200 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}