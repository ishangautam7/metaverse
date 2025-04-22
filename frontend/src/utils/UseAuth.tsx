import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { validateToken } from "./Routes";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean |null>(null)
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(()=>{
        const token = localStorage.getItem("token")
        if(!token){
            setIsAuthenticated(false)
            setIsLoading(false)
            router.push('/?showLogin=true')
            return
        }else{
            const verifyToken = async () =>{
                try{
                    const response = await axios.get(validateToken, {headers:{
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }})

                    if(response.status === 200){
                        setIsAuthenticated(true)
                        setIsLoading(false)
                        setUser(response.data.user)
                    }else{
                        setIsAuthenticated(false)
                        setIsLoading(false)
                        localStorage.removeItem("token")
                        return
                    }
                }catch(err){
                    setIsAuthenticated(false)
                    localStorage.removeItem("token")
                    router.push('/')
                }
            }
            verifyToken()
        }

    }, [router])

    return {isAuthenticated, user, isLoading}
}