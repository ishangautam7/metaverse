"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import axios from "axios"
import GoogleLogo from "@/assests/google-logo.svg"
import Link from "next/link"
import { registerRoute } from "@/utils/Routes"

const RegisterPage = () => {
  const router = useRouter()

  const [values, setValues] = useState({
    username: '',
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleValidation = () => {
    const { username, email, password } = values
    if (!username || !email || !password) {
      toast.error("All fields are required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (handleValidation()) {
      try {
        const { data, status } = await axios.post(registerRoute, values)
        if (status === 201) {
          toast.success("Registered successfully")
          router.push("/")
        } else {
          toast.error(data.msg || "Registration failed")
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const msg = err.response?.data?.msg
          toast.error(typeof msg === "string" ? msg : "Something went wrong")
        } else if (err instanceof Error) {
          toast.error(err.message)
        } else {
          toast.error("Something went wrong")
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:50px_50px] opacity-5"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-30"></div>
        
        <div className="relative bg-black/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80 mb-4">
              <span>✨ Join NexRoom</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-400">Start your virtual collaboration journey</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <span></span> Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Choose an username"
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 placeholder-gray-500 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <span></span> Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
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
                placeholder="Create a secure password"
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 placeholder-gray-500 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              className="group w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold py-4 rounded-xl hover:from-purple-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">Create Account</span>
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
            Already have an account?{" "}
            <Link href="/?showLogin=true" className="text-purple-400 hover:text-purple-300 underline transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage