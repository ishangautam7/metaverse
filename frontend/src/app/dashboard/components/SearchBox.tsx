import axios from "axios"
import { useSearchParams, useRouter } from "next/navigation"
import { findMapByUIdRoute } from "@/utils/Routes"
import toast from "react-hot-toast"

interface MapData { _id: string; name: string; width: number; height: number; image?: string; mapUID:string }

type SearchProps = {
    roomId: number,
    setRoomId: React.Dispatch<React.SetStateAction<number>>
    setFoundMap: React.Dispatch<React.SetStateAction<MapData | null>>
}

export const SearchBox = ({roomId, setRoomId, setFoundMap}:SearchProps) => {
    const router = useRouter()
    const params = useSearchParams()
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setRoomId(value === '' ? 0 : parseInt(value, 10));
        }
    }
    
    const handleJoin = async () =>{
        if(roomId>0){
            router.push(`?ruid=${roomId}`);
            const ruid  = params.get('ruid')
            const response = await axios.get(`${findMapByUIdRoute}/${ruid}`)
            if(response.status === 250){
                toast.error(response.data.msg)
                setFoundMap(null)
            }else if(response.status === 200){
                const storedUser = JSON.parse(localStorage.getItem("user") ?? "{}");               
                const myId = storedUser.id
                if(myId == response.data.userId){
                    toast.success("You own this map")
                    return
                }
                setFoundMap(response.data.map)
                toast.success(response.data.msg)
            }
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="roomId" className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                    <span>🔍</span> Find Virtual Space
                </label>
                <div className="flex gap-2">
                    <input 
                        id="roomId" 
                        type="text" 
                        value={roomId || ''} 
                        onChange={handleInputChange} 
                        placeholder="Enter Map UID..." 
                        className="flex-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" 
                    />
                    <button 
                        onClick={handleJoin} 
                        className="px-4 bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                    > 
                        🔍
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter a 12-digit Map UID to join someone else's space</p>
            </div>
        </div>
    )
}