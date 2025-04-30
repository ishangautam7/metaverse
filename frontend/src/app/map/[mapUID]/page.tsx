"use client"

import { useParams } from "next/navigation"
import CanvaMap from "../components/CanvaMap"
import AuthGuard from "@/utils/AuthGuard"
import { useEffect, useState } from "react"
import axios from "axios"
import { checkmaproute } from "@/utils/Routes"
import { useRouter } from "next/navigation"
import { Loading } from "@/components/Loading"

const CanvaRoomPage = () => {
    const router = useRouter()
    const params = useParams()
    const [mapExists, setMapExists] = useState<boolean | null>(null)
    const mapUIDstr = params.mapUID as string
    const mapUID = Number(mapUIDstr)

    useEffect(() => {
        const checkMapExistence = async () => {
            const response = await axios.post(checkmaproute, { mapUID })
            if (response.status === 200) {
                setMapExists(response.data.found)
            }
        }

        checkMapExistence()
    }, [mapExists])

    useEffect(() => {
        if (mapExists === false) {
            router.push('/');
        }
    }, [mapExists, router]);

    if (mapExists === null) {
        return <Loading />;
    }
    const user = JSON.parse(localStorage.getItem("user")??"{}")
    const username = user.username
    return (
        <AuthGuard>
        <div>
            {1 &&
                <CanvaMap username={username} mapUID={mapUID} width={1800} height={920} />
            }
        </div>

        </AuthGuard>
    )
}

export default CanvaRoomPage