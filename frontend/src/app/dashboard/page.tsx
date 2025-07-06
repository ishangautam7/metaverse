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

      <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:50px_50px] opacity-5"></div>
        </div>

        <NavBar dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} />

        <main className="flex flex-col md:flex-row flex-1 overflow-hidden relative z-10">
          {/* Enhanced Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-black/40 backdrop-blur-lg border-r border-white/10 p-6 shadow-2xl flex flex-col">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Dashboard</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-400 text-sm">Create and join virtual spaces</p>
            </div>

            {/* Search Box */}
            <div className="mb-6">
              <SearchBox roomId={roomId} setRoomId={setRoomId} setFoundMap={setFoundMap} />
            </div>

            {/* Join Map Button */}
            <button 
              onClick={handleJoin} 
              className="group w-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border-2 border-white/20 text-white py-3 mb-6 rounded-xl font-semibold hover:from-purple-600/30 hover:to-cyan-600/30 hover:border-white/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                🔗 Join Selected Map
              </span>
            </button>

            {/* Found Map Display */}
            {foundMap && (
              <div 
                onClick={() => { setSelectedMapId(foundMap._id)}} 
                className={`mb-6 cursor-pointer bg-white/5 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${selectedMapId === foundMap._id ? 'border-green-400 shadow-green-400/20' : 'border-white/10 hover:border-white/20'}`}
              >
                <div className="h-32 relative">
                  <Image src={MapImage || foundMap.image} alt={foundMap.name} layout="fill" objectFit="cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Found
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-medium text-sm">{foundMap.name}</h3>
                  <p className="text-gray-400 text-xs">UID: {foundMap.mapUID}</p>
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreate(true)}
              className="group w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Create New Map
              </span>
            </button>
          </div>

          {/* Enhanced Maps Grid */}
          <div className="flex-1 overflow-y-auto p-6 relative">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Your Virtual Spaces
              </h2>
              <p className="text-gray-400">Manage and explore your created maps</p>
            </div>

            {maps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-6xl mb-4 opacity-50">🗺️</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Maps Yet</h3>
                <p className="text-gray-400 mb-6">Create your first virtual space to get started</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium rounded-full hover:from-purple-700 hover:to-cyan-600 transition-all"
                >
                  Create Your First Map
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {maps.map(map => (
                  <div 
                    key={map._id} 
                    onClick={() => setSelectedMapId(map._id)} 
                    className={`group cursor-pointer bg-white/5 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${selectedMapId === map._id ? 'border-green-400 shadow-green-400/20 scale-105' : 'border-white/10 hover:border-white/20 hover:scale-102'}`}
                  >
                    {/* Glow Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 ${selectedMapId === map._id ? 'opacity-50' : ''}`}></div>
                    
                    <div className="relative">
                      <div className="h-40 relative overflow-hidden">
                        <Image 
                          src={MapImage || map.image} 
                          alt={map.name} 
                          layout="fill" 
                          objectFit="cover"
                          className="group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Selection Indicator */}
                        {selectedMapId === map._id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">
                          {map.name}
                        </h3>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>{map.width} × {map.height}</span>
                          <span>UID: {map.mapUID}</span>
                        </div>
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
        <MapDetailsPopup mapId={selectedMapId} onClose={() => setShowDetailsPopup(false)}/>
      )}
    </AuthGuard>
  )
}