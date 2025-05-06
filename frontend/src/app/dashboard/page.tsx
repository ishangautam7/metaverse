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

  // Create handler
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

  // Join handler
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

      <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <NavBar dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} />

        <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 bg-gradient-to-br from-black via-gray-900 to-black p-6 shadow-lg flex flex-col">
            {/* 1. Search Box */}
            <SearchBox roomId={roomId} setRoomId={setRoomId} setFoundMap={setFoundMap} />

            {/* 2. Join Map Button */}
            <button onClick={handleJoin} className="w-full bg-transparent border-2 border-white text-white py-2 mb-4 rounded-lg font-semibold hover:bg-white/10 transition">
              🔗 Join Map
            </button>

            {/* show the searched map */}
            {foundMap && (
              <div onClick={() => { setSelectedMapId(foundMap._id)}} className={`my-4 cursor-pointer bg-white bg-opacity-10 backdrop-blur-md rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all ${selectedMapId === foundMap._id ? 'border-6 border-green-400' : 'border border-transparent'}`}>
                <div className="h-32 relative">
                  <Image src={MapImage || foundMap.image} alt={foundMap.name} layout="fill" objectFit="cover" />
                </div>
                <div className="p-2 text-center text-black text-sm font-medium">
                  {foundMap.name}
                </div>
              </div>
            )}

            {/* Spacer pushes create to bottom */}
            <div className="mt-auto">
              <button
                onClick={() => setShowCreate(true)}
                className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                + Create New Map
              </button>
            </div>
          </div>

          {/* Maps Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Your Maps</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map(map => (
                <div key={map._id} onClick={() => setSelectedMapId(map._id)} className={`cursor-pointer bg-white bg-opacity-10 backdrop-blur-md rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all ${selectedMapId === map._id ? 'border-2 border-green-400' : 'border border-transparent'}`}>
                  <div className="h-40 relative">
                    <Image src={MapImage || map.image} alt={map.name} layout="fill" objectFit="cover"/>
                  </div>
                  <div className="p-3 text-center text-black text-sm font-medium">
                    {map.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {showDetailsPopup && selectedMapId && (
        <MapDetailsPopup mapId={selectedMapId} onClose={() => setShowDetailsPopup(false)}/>
      )}
    </AuthGuard>
  )
}
