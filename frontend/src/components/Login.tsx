"use client"

import Cross from "@/assests/cross.svg"
import { useEffect, useRef, useState } from "react"
import GoogleLogo from "@/assests/google-logo.svg"
import toast from "react-hot-toast"
import axios from "axios"
import { loginRoute } from "@/utils/Routes"
import Link from "next/link"
import {useRouter} from "next/navigation"
interface LoginProps {
    onClose: () => void
}

export const Login = ({ onClose }: LoginProps) => {
    const router = useRouter()
    const loginRef = useRef<HTMLDivElement>(null)
    const [values, setValues] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [e.target.name]: e.target.value })
    }

    const handleValidation = () => {
        const { email, password } = values

        if (email === "") {
            toast.error("Email is required")
            return false
        }
        else if (password === "") {
            toast.error("Password is required")
            return false
        }
        return true
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!handleValidation()) {
            return
        }

        try {
            const { email, password } = values
            const { data, status } = await axios.post(loginRoute, {
                email, password
            })
            if (status === 200) {
                toast.success("Successfully logged In")
                localStorage.setItem("token", data.token)
                const user = {
                    id: data.user.id,
                    username: data.user.username,
                }
                localStorage.setItem("user", JSON.stringify(user))
                onClose()
                router.push('/dashboard')
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.data && typeof e.response.data.msg === "string") {
                toast.error(e.response.data.msg)
              } else {
                toast.error("An unexpected error occurred")
              }
        }
    }

    useEffect(() => {
        const handleClickOutSide = (event: MouseEvent) => {
            if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutSide)
        return () => {
            document.removeEventListener("mousedown", handleClickOutSide)
        }
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-md bg-gradient-to-b from-neutral-900 to-black text-white p-8 rounded-2xl shadow-lg border border-white/10" ref={loginRef} >
                <button className="absolute top-3 right-3">
                    <Cross className="h-5 w-5 text-white hover:text-red-400 transition" onClick={onClose} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white text-center tracking-wide">
                    Welcome Back
                </h2>

                <form className="flex flex-col gap-4" onSubmit={(event) => handleSubmit(event)} >
                    <input type="email" name="email" placeholder="Email" className="bg-black/30 border border-white/10 p-3 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30" onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password" className="bg-black/30 border border-white/10 p-3 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30" onChange={handleChange} />
                    <button type="submit" className="bg-white text-black font-medium py-2 rounded-lg hover:bg-gray-200 transition">
                        Login
                    </button>
                </form>

                <div className="my-4 border-t border-white/10" />

                <button onClick={()=>toast("Google Auth not Wired Yet")} className="flex-col w-full py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">
                    <div className="flex justify-center gap-2">
                        <GoogleLogo className="" />
                        Login with Google
                    </div>
                </button>

                <p className="text-sm text-white/60 text-center mt-4">
                    {" Don't have an account? "}
                    <Link href="/register" className="text-white underline hover:text-white/80">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    )
}