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

type MapFormData = { name: string; width: number; height: number }
interface MapData { _id: string; name: string; width: number; height: number; image?: string }

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [maps, setMaps] = useState<MapData[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [roomId, setRoomId] = useState("")

  // Auth redirect
  useEffect(() => {
    if (isAuthenticated === false) {
      localStorage.removeItem("token")
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Fetch maps
  const loadMaps = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(fetchmaproute, { token })
      if (res.status === 200) setMaps(res.data.maps)
      else toast.error("Failed to fetch maps")
    } catch {
      toast.error("Error fetching maps")
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
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post('/', { mapId: roomId, token })
      if (res.status === 200) {
        toast.success("Joined map!")
        setRoomId("")
        loadMaps()
      } else {
        toast.error(res.data.msg || "Failed to join")
      }
    } catch {
      toast.error("Error joining map")
    }
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
            <div className="mb-4">
              <label htmlFor="roomId" className="text-sm text-white/70 block mb-1">
                Enter Map UID
              </label>
              <div className="flex gap-2">
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  placeholder="Map UID"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                />
                <button
                  onClick={handleJoin}
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* 2. Join Map Button */}
            <button
              onClick={handleJoin}
              className="w-full bg-transparent border-2 border-white text-white py-2 mb-4 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              🔗 Join Map
            </button>

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
                <div
                  key={map._id}
                  className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="h-40 relative">
                    <Image
                      src={MapImage || map.image}
                      alt={map.name}
                      layout="fill"
                      objectFit="cover"
                    />
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
    </AuthGuard>
  )
}
