import axios from "axios"
import React, { useEffect, useState } from "react"
import { getsinglemapdetailsroute } from "@/utils/Routes"
import { useRouter } from "next/navigation"

// Interfaces for Map Data and Response
interface Owner {
  username: string;
}

interface MapData {
  _id: string;
  name: string;
  mapUID: string;
  owner: Owner;
  width: number;
  height: number;
  image?: string;
}

interface MapDetailsPopupProps {
  mapId: string
  onClose: () => void
}

const MapDetailsPopup: React.FC<MapDetailsPopupProps> = ({ onClose, mapId }) => {
    const [mapData, setMapData] = useState<MapData | null>(null)
    const [owner, setOwner] = useState("")
    const [loading, setLoading] = useState(true)

    const router = useRouter()
    
    // Fetch map details when the component is mounted or mapId changes
    useEffect(() => {
        const fetchSingleMapData = async () => {
            try {
                const response = await axios.post(getsinglemapdetailsroute, { mapId })
                if (response.status === 200) {
                    setMapData(response.data.map) 
                    setOwner(response.data.owner)
                }
            } catch (err) {
                console.error("Error fetching map data:", err)
            } finally {
                setLoading(false)
            }
        }

        if (mapId) {
            fetchSingleMapData()
        }
    }, [mapId])

    const handleEnterClick = () => {
        if (mapData) {
            router.push(`/map/${mapData.mapUID}`)
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50">
                <div className="bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white">Loading map details...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!mapData) {
        return null
    }

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative bg-black/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 w-[90%] max-w-lg text-white animate-fadeIn">
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
                            <span>🗺️ Map Details</span>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {mapData.name}
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {/* Map Info Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">🆔</span>
                                    <span className="text-gray-400 text-sm">Map UID</span>
                                </div>
                                <div className="text-white font-mono text-lg">{mapData.mapUID}</div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">👤</span>
                                    <span className="text-gray-400 text-sm">Created by</span>
                                </div>
                                <div className="text-white font-medium">{owner}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">↔️</span>
                                        <span className="text-gray-400 text-sm">Width</span>
                                    </div>
                                    <div className="text-white font-medium">{mapData.width}px</div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">↕️</span>
                                        <span className="text-gray-400 text-sm">Height</span>
                                    </div>
                                    <div className="text-white font-medium">{mapData.height}px</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 hover:border-white/30 transition-all"
                            >
                                Cancel
                            </button>

                            <button 
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium rounded-xl hover:from-purple-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-purple-500/25" 
                                onClick={handleEnterClick}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    🚀 Enter Space
                                </span>
                            </button>
                        </div>
                    </div>
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

export default MapDetailsPopup