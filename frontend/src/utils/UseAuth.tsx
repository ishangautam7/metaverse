import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import axios from "axios"
import { validateToken } from "./Routes"

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser]               = useState<unknown>(null)
  const [isLoading, setIsLoading]     = useState(true)

  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setIsAuthenticated(false)
      setIsLoading(false)

      if (pathname !== "/") {
        router.push("/")
      }

      return
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(validateToken, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 200) {
          setIsAuthenticated(true)
          setUser(response.data.user)
        } else {
          setIsAuthenticated(false)
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
        }
      } catch {
        setIsAuthenticated(false)
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [router, pathname])

  return { isAuthenticated, user, isLoading }
}
