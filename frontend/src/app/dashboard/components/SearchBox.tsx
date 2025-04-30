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
            console.log(ruid)
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
        <div className="mb-4">
            <label htmlFor="roomId" className="text-sm text-white/70 block mb-1">
                Enter Map UID
            </label>
            <div className="flex gap-2">
                <input id="roomId" type="text" value={roomId} onChange={handleInputChange} placeholder="Map UID" className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition" />
                <button onClick={handleJoin} className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"> 🔍 </button>
            </div>
        </div>
    )
}