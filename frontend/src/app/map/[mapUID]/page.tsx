import CanvaRoomClient from "./CanvaRoomClient"

export async function generateStaticParams() {
    return []
}

const CanvaRoomPage = () => {
    return <CanvaRoomClient />
}

export default CanvaRoomPage