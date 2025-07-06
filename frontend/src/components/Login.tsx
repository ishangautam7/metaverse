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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-[90%] max-w-md" ref={loginRef}>
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-30"></div>
                
                <div className="relative bg-black/80 backdrop-blur-xl text-white p-8 rounded-2xl shadow-2xl border border-white/20 animate-fadeIn">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-xl font-bold text-gray-300 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    >
                        ×
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                            Sign In
                        </h2>
                        <p className="text-gray-400">Continue your virtual journey</p>
                    </div>

                    <form className="space-y-6" onSubmit={(event) => handleSubmit(event)}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <span></span> Email
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Enter your email" 
                                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 placeholder-gray-500 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" 
                                onChange={handleChange} 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <span></span> Password
                            </label>
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Enter your password" 
                                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 placeholder-gray-500 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all" 
                                onChange={handleChange} 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="group w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold py-4 rounded-xl hover:from-purple-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative z-10">Sign In</span>
                        </button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-white/20"></div>
                        <span className="px-4 text-gray-400 text-sm">or</span>
                        <div className="flex-1 border-t border-white/20"></div>
                    </div>

                    <button 
                        onClick={() => toast("Google Auth coming soon!")} 
                        className="group w-full py-3 border border-white/30 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                    >
                        <div className="flex justify-center items-center gap-3">
                            <GoogleLogo className="h-5 w-5" />
                            <span className="text-white font-medium">Continue with Google</span>
                        </div>
                    </button>

                    <p className="text-sm text-gray-400 text-center mt-6">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-purple-400 hover:text-purple-300 underline transition-colors">
                            Create one here
                        </Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}