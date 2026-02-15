"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import axios from "axios"
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
      <div className="w-full max-w-sm">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">
              Create an account
            </h2>
            <p className="text-neutral-500 text-sm">Get started with NexRoom</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">Username</label>
              <input
                type="text"
                name="username"
                placeholder="johndoe"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2.5 text-sm placeholder-neutral-600 text-white outline-none focus:border-neutral-600 transition-colors"
                onChange={handleChange}
              />
            </div>

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
              Create account
            </button>
          </form>

          <p className="text-xs text-neutral-500 text-center mt-5">
            Already have an account?{" "}
            <Link href="/?showLogin=true" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage