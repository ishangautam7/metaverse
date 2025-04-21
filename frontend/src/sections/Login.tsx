"use client"

import Cross from "@/assests/cross.svg"
import { useEffect, useRef } from "react"
import GoogleLogo from "@/assests/google-logo.svg"
interface LoginProps {
    onClose: () => void
}

export const Login = ({ onClose }: LoginProps) => {
    const loginRef = useRef<HTMLDivElement>(null)

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

                <form className="flex flex-col gap-4">
                    <input type="email" placeholder="Email" className="bg-black/30 border border-white/10 p-3 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30" />
                    <input type="password" placeholder="Password" className="bg-black/30 border border-white/10 p-3 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30" />
                    <button type="submit" className="bg-white text-black font-medium py-2 rounded-lg hover:bg-gray-200 transition">
                        Login
                    </button>
                </form>

                <div className="my-4 border-t border-white/10" />

                <button className="flex-col w-full py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">
                    <div className="flex justify-center gap-2">
                        <GoogleLogo className="" />
                        Login with Google
                    </div>
                </button>
            </div>
        </div>
    )
}