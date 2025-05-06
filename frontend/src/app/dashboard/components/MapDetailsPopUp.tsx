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

            }
        }

        if (mapId) {
            fetchSingleMapData()
        }
    }, [mapId])

    if (!mapData) {
        return null // Don't render the popup until data is fetched
    }

    const handleEnterClick = () => {
        router.push(`/map/${mapData.mapUID}`)
    }

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/20 w-[90%] max-w-xl text-white relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-xl font-bold text-gray-300 hover:text-white transition"
                >
                    ×
                </button>

                <h2 className="text-3xl font-semibold mb-6 text-center">🗺️ Map Details</h2>

                <div className="space-y-4">
                    <p><strong>Name:</strong> {mapData.name}</p>
                    <p><strong>UID:</strong> {mapData.mapUID}</p>
                    <p><strong>Owner:</strong> {owner}</p>
                </div>

                <div className="mt-6 flex justify-between gap-3 flex-wrap">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white/20 text-white font-semibold rounded hover:bg-white/30 transition"
                    >
                        Close
                    </button>

                    <button className="px-6 py-3 bg-purple-700 text-white font-semibold rounded hover:bg-purple-800 transition" onClick={handleEnterClick}>
                        Enter Room
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MapDetailsPopup
