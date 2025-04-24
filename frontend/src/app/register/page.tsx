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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-white/10 text-white px-4">
      <div className="w-full max-w-md bg-gradient-to-b from-neutral-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10">
        <h2 className="text-3xl font-bold mb-6 text-center">Create an Account</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="bg-black/30 border border-white/10 p-3 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="bg-black/30 border border-white/10 p-3 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="bg-black/30 border border-white/10 p-3 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            onChange={handleChange}
          />
          <button type="submit" className="bg-white text-black font-medium py-2 rounded-lg hover:bg-gray-200 transition">
            Register
          </button>
        </form>

        <div className="my-4 border-t border-white/10" />

        <button onClick={() => toast("Google Auth not wired yet")} className="flex-col w-full py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">
          <div className="flex justify-center gap-2 items-center">
            <GoogleLogo className="h-5 w-5" />
            <span>Register with Google</span>
          </div>
        </button>

        <p className="text-sm text-white/60 text-center mt-4">
          Already have an account?{" "}
          <Link href="/?showLogin=true" className="text-white underline hover:text-white/80">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
