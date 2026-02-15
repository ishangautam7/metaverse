"use client"
import { useState, useRef, useEffect } from "react"
import { MAP_TEMPLATES, MapTemplate } from "./mapTemplates"
import { Building2, BookOpen, Coffee, LayoutGrid } from "lucide-react"

type MapFormData = {
  name: string
  width: number
  height: number
  templateId?: string
}

interface PopupFormProps {
  onSubmit: (data: MapFormData) => void
  onClose: () => void
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  blank: <LayoutGrid size={20} />,
  office: <Building2 size={20} />,
  classroom: <BookOpen size={20} />,
  lounge: <Coffee size={20} />,
}

export default function PopupForm({ onSubmit, onClose }: PopupFormProps) {
  const [name, setName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank")
  const popupRef = useRef<HTMLDivElement>(null)

  const template = MAP_TEMPLATES.find(t => t.id === selectedTemplate) || MAP_TEMPLATES[0]

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
    onSubmit({
      name,
      width: template.width,
      height: template.height,
      templateId: selectedTemplate
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg w-[90%] max-w-md text-white">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white mb-1">New space</h2>
          <p className="text-neutral-500 text-sm">Choose a template and name your space</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400">Template</label>
            <div className="grid grid-cols-2 gap-2">
              {MAP_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`text-left p-3 rounded-lg border transition-all ${selectedTemplate === t.id
                      ? "border-white bg-neutral-800"
                      : "border-neutral-800 hover:border-neutral-600"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={selectedTemplate === t.id ? "text-white" : "text-neutral-500"}>
                      {TEMPLATE_ICONS[t.id] || <LayoutGrid size={20} />}
                    </span>
                    <span className="text-sm font-medium">{t.name}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-tight">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
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

          {/* Template info */}
          {selectedTemplate !== "blank" && (
            <div className="text-xs text-neutral-600 bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2">
              {template.rooms.length} rooms · {template.obstacles.length} objects · {template.width}×{template.height}px
            </div>
          )}

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