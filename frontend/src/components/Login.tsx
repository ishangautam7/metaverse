"use client"

import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import { loginRoute } from "@/utils/Routes"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-sm" ref={loginRef}>
                <div className="bg-neutral-900 border border-neutral-800 text-white p-6 rounded-lg">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-neutral-500 hover:text-white w-6 h-6 flex items-center justify-center transition-colors"
                    >
                        ×
                    </button>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white mb-1">
                            Sign in
                        </h2>
                        <p className="text-neutral-500 text-sm">Enter your credentials to continue</p>
                    </div>

                    <form className="space-y-4" onSubmit={(event) => handleSubmit(event)}>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-400">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2.5 text-sm placeholder-neutral-600 text-white outline-none focus:border-neutral-600 transition-colors"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-400">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2.5 text-sm placeholder-neutral-600 text-white outline-none focus:border-neutral-600 transition-colors"
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-neutral-900 font-medium py-2.5 rounded-md hover:bg-neutral-200 transition-colors text-sm"
                        >
                            Sign in
                        </button>
                    </form>

                    <p className="text-xs text-neutral-500 text-center mt-5">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-white hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}