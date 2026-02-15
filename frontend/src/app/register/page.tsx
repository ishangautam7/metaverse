"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import axios from "axios"
import Image from "next/image"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4 relative overflow-hidden">
      {/* Background Effects Removed */}



      <div className="relative w-full max-w-md">
        {/* Glow Effect Removed */}

        <div className="relative bg-gray-900 p-8 rounded-2xl shadow-2xl border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
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
              className="group w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-lg"
            >
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
              <Image
                src="/assests/google-logo.svg"
                alt="Google"
                width={20}
                height={20}
                className="h-5 w-5"
              />
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