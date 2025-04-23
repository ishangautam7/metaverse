import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { validateToken } from "./Routes";
import next from "next";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setIsAuthenticated(false)
            setIsLoading(false)
            if (pathname !== "/") {
                router.push("/");
            }
            return
        } else {
            const verifyToken = async () => {
                try {
                    const response = await axios.get(validateToken, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        }
                    })

                    if (response.status === 200) {
                        setIsAuthenticated(true)
                        setIsLoading(false)
                        setUser(response.data.user)
                    } else {
                        setIsAuthenticated(false)
                        setIsLoading(false)
                        localStorage.removeItem("token")
                        return
                    }
                } catch (err) {
                    setIsAuthenticated(false)
                    localStorage.removeItem("token")
                    router.push('/')
                    console.log(err)
                }
            }
            verifyToken()
        }

    }, [router])

    return { isAuthenticated, user, isLoading }
}