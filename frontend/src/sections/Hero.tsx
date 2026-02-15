"use client"

import HeroImage from "@/assests/hero.png"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export const Hero = () => {
    const router = useRouter()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Solid Background */}
            <div className="absolute inset-0 bg-gray-950">
            </div>



            <div className="relative z-10 max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-12 px-4 sm:px-6 lg:px-8 py-20">

                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left space-y-8">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-white">
                            <span className="block">
                                Welcome to
                            </span>
                            <span className="block text-purple-400">
                                NexRoom
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Step into the future of virtual collaboration. Create, connect, and collaborate in your own
                            <span className="text-purple-400 font-semibold"> 2D metaverse</span> -
                            where distance disappears and creativity flourishes.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button
                            onClick={() => router.push('/register')}
                            className="group relative px-8 py-4 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all duration-300 shadow-lg"
                        >
                            <span className="relative z-10">Start Your Journey</span>
                        </button>

                        <button className="group px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
                            <span className="flex items-center gap-2">
                                Watch Demo
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4h6zM4 20h16" />
                                </svg>
                            </span>
                        </button>
                    </div>


                </div>

                {/* Right Content - Hero Image */}
                <div className="flex-1 flex justify-center lg:justify-end w-full">
                    {/* Simplified Image Container */}
                    <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image
                            src={HeroImage}
                            alt="NexRoom 2D Metaverse Preview"
                            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                            width={500}
                            height={500}
                            priority
                        />

                        {/* Overlay with Play Button */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>
        </section >
    )
}