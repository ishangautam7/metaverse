"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import NavBar from "./components/NavBar"
import { useRouter } from "next/navigation"
import MapImage from "@/assests/hero.png"
import { useAuth } from "@/utils/UseAuth"
import { Loading } from "@/components/Loading"
import AuthGuard from "@/utils/AuthGuard"
import PopupForm from "./components/MapPopup"
import axios from "axios"
import toast from "react-hot-toast"
import { mapcreateroute, fetchmaproute } from "@/utils/Routes"
import { SearchBox } from "./components/SearchBox"
import MapDetailsPopup from "./components/MapDetailsPopUp"
import { Plus } from "lucide-react"

type MapFormData = { name: string; width: number; height: number }
interface MapData { _id: string; name: string; width: number; height: number; image?: string; mapUID: string }

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [maps, setMaps] = useState<MapData[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [roomId, setRoomId] = useState<number>(0)
  const [foundMap, setFoundMap] = useState<MapData | null>(null)
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null)
  const [showDetailsPopup, setShowDetailsPopup] = useState(false)

  useEffect(() => {
    if (isAuthenticated === false) {
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      router.push("/")
    }
  }, [isAuthenticated, router])

  const loadMaps = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(fetchmaproute, { token })
      if (res.status === 200) setMaps(res.data.maps)
      else toast.error("Failed to fetch maps")
    } catch (err) {
    }
  }
  useEffect(() => { if (!isLoading) loadMaps() }, [isLoading])

  if (isLoading) return <Loading />

  const handleCreate = async (data: MapFormData) => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(mapcreateroute, { ...data, token })
      if (res.status === 200) {
        toast.success(res.data.msg)
        setShowCreate(false)
        loadMaps()
      } else {
        toast.error(res.data.msg)
      }
    } catch {
      toast.error("Error creating map")
    }
  }

  const handleJoin = async () => {
    if (selectedMapId == null) {
      toast.error("No map selected")
      return
    }
    setShowDetailsPopup(true)
  }

  return (
    <AuthGuard>
      {showCreate && (
        <PopupForm onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      )}

      <div className="flex flex-col h-screen bg-neutral-950 text-white">
        <NavBar dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} />

        <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-72 lg:w-80 bg-neutral-950 border-r border-neutral-800 p-5 flex flex-col">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-white mb-0.5">Dashboard</h1>
              <p className="text-neutral-500 text-sm">Create and join spaces</p>
            </div>

            <div className="mb-4">
              <SearchBox roomId={roomId} setRoomId={setRoomId} setFoundMap={setFoundMap} />
            </div>

            <button
              onClick={handleJoin}
              disabled={!selectedMapId}
              className="w-full border border-neutral-700 text-white py-2 mb-4 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Join selected map
            </button>

            {foundMap && (
              <div
                onClick={() => { setSelectedMapId(foundMap._id) }}
                className={`mb-4 cursor-pointer bg-neutral-900 rounded-md overflow-hidden border ${selectedMapId === foundMap._id ? 'border-white' : 'border-neutral-800 hover:border-neutral-700'} transition-colors`}
              >
                <div className="h-24 relative">
                  <Image src={MapImage || foundMap.image} alt={foundMap.name} layout="fill" objectFit="cover" />
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium">{foundMap.name}</h3>
                  <p className="text-neutral-500 text-xs mt-0.5">UID: {foundMap.mapUID}</p>
                </div>
              </div>
            )}

            <div className="flex-1" />

            <button
              onClick={() => setShowCreate(true)}
              className="w-full bg-white text-neutral-900 py-2.5 rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create new map
            </button>
          </div>

          {/* Maps grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-0.5">Your spaces</h2>
              <p className="text-neutral-500 text-sm">Select a map to view details or join</p>
            </div>

            {maps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-neutral-800 rounded-lg">
                <p className="text-neutral-500 text-sm mb-3">No maps yet</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 bg-white text-neutral-900 text-sm font-medium rounded-md hover:bg-neutral-200 transition-colors"
                >
                  Create your first map
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {maps.map(map => (
                  <div
                    key={map._id}
                    onClick={() => setSelectedMapId(map._id)}
                    className={`cursor-pointer bg-neutral-900 rounded-md overflow-hidden border transition-colors ${selectedMapId === map._id ? 'border-white' : 'border-neutral-800 hover:border-neutral-700'}`}
                  >
                    <div className="h-32 relative overflow-hidden">
                      <Image
                        src={MapImage || map.image}
                        alt={map.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>

                    <div className="p-3">
                      <h3 className="text-white text-sm font-medium">{map.name}</h3>
                      <div className="flex justify-between items-center text-xs text-neutral-500 mt-1">
                        <span>{map.width} × {map.height}</span>
                        <span>{map.mapUID}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showDetailsPopup && selectedMapId && (
        <MapDetailsPopup mapId={selectedMapId} onClose={() => setShowDetailsPopup(false)} />
      )}
    </AuthGuard>
  )
}