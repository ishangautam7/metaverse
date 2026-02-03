import dynamic from "next/dynamic"

const CanvaRoomClient = dynamic(() => import("./CanvaRoomClient"))

export default function CanvaRoomPage() {
    return <CanvaRoomClient />
}
