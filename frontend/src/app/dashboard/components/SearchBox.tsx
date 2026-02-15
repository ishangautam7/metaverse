import axios from "axios"
import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { findMapByUIdRoute } from "@/utils/Routes"
import toast from "react-hot-toast"
import { Search } from "lucide-react"

interface MapData { _id: string; name: string; width: number; height: number; image?: string; mapUID: string }

type SearchProps = {
    roomId: number,
    setRoomId: React.Dispatch<React.SetStateAction<number>>
    setFoundMap: React.Dispatch<React.SetStateAction<MapData | null>>
}

export const SearchBox = ({ roomId, setRoomId, setFoundMap }: SearchProps) => {
    const router = useRouter()
    const params = useSearchParams()


    useEffect(() => {
        if (roomId > 0) {
            router.push(`?ruid=${roomId}`)
        }
    }, [roomId])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setRoomId(value === '' ? 0 : parseInt(value, 10));
        }
        router.push(`?ruid=${roomId}`)
    }

    const handleJoin = async () => {
        if (roomId > 0) {
            const ruid = params.get('ruid')
            const response = await axios.get(`${findMapByUIdRoute}/${ruid}`)
            if (response.status === 250) {
                const msg = response.data.msg
                toast.error(typeof msg === 'string' ? msg : "Map not found")
                setFoundMap(null)
            } else if (response.status === 200) {
                const storedUser = JSON.parse(localStorage.getItem("user") ?? "{}");
                const myId = storedUser.id
                if (myId == response.data.userId) {
                    toast.success("You own this map")
                    return
                }
                setFoundMap(response.data.map)
                const msg = response.data.msg
                toast.success(typeof msg === 'string' ? msg : "Map found")
            }
        }
    }

    return (
        <div className="space-y-1.5">
            <label htmlFor="roomId" className="text-xs font-medium text-neutral-400">
                Find a space
            </label>
            <div className="flex gap-2">
                <input
                    id="roomId"
                    type="text"
                    value={roomId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter Map UID..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-600 transition-colors"
                />
                <button
                    onClick={handleJoin}
                    className="px-3 bg-neutral-800 text-neutral-400 hover:text-white rounded-md transition-colors"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}