"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import NavBar from "./NavBar"
import { useRouter } from "next/navigation"
import MapImage from "@/assests/hero.png"
import { useAuth } from "@/utils/UseAuth"
import { Loading } from "@/components/Loading"
const maps = [
  { id: 1, name: "Map of Downtown", image: MapImage },
  { id: 2, name: "Ancient Temple Layout", image: MapImage },
  { id: 3, name: "Fantasy World Alpha", image: MapImage },
  { id: 4, name: "Futuristic City", image: MapImage },
  { id: 5, name: "Hidden Dungeon", image: MapImage },
]

export default function Dashboard() {
  const router = useRouter()
  const {isAuthenticated, user, isLoading} = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated === false) {
      localStorage.removeItem("token");
      router.push('/'); 
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <Loading />
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <NavBar dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} />

      <main className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 h-full bg-black bg-opacity-60 p-6 shadow-lg rounded-lg transition-all hover:bg-opacity-80">
          <button className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all">
            + Create New Map
          </button>
        </div>

        <div className="flex-1 p-6">
          <h2 className="text-xl font-semibold mb-4">Your Maps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {maps.map((map) => (
              <div
                key={map.id}
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="h-40 relative">
                  <Image
                    src={map.image}
                    alt={map.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-3 text-center text-white text-sm font-medium">
                  {map.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
