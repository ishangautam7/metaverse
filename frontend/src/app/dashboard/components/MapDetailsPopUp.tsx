import axios from "axios"
import React, { useEffect, useState } from "react"
import { getsinglemapdetailsroute } from "@/utils/Routes"
import { useRouter } from "next/navigation"

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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                    <span className="text-neutral-400 text-sm">Loading...</span>
                </div>
            </div>
        )
    }

    if (!mapData) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg w-[90%] max-w-md text-white">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-white">{mapData.name}</h2>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-neutral-800">
                        <span className="text-neutral-500">Map UID</span>
                        <span className="text-white font-mono">{mapData.mapUID}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-800">
                        <span className="text-neutral-500">Created by</span>
                        <span className="text-white">
                            {typeof owner === 'string' ? owner : (owner as any)?.username || "Unknown"}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-800">
                        <span className="text-neutral-500">Dimensions</span>
                        <span className="text-white">{mapData.width} × {mapData.height}px</span>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-neutral-700 text-white text-sm rounded-md hover:bg-neutral-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-md hover:bg-neutral-200 transition-colors"
                        onClick={handleEnterClick}
                    >
                        Enter space
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MapDetailsPopup