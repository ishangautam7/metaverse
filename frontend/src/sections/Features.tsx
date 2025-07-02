"use client"

import { useState } from "react"

const features = [
    {
        icon: "🌐",
        title: "2D Metaverse",
        description: "Navigate through beautifully designed 2D spaces with smooth, intuitive controls",
        color: "from-purple-500 to-purple-700"
    },
    {
        icon: "🎥",
        title: "Video Chat",
        description: "Real-time video and audio communication with crystal clear quality",
        color: "from-cyan-500 to-cyan-700"
    },
    {
        icon: "🏗️",
        title: "Custom Rooms",
        description: "Design and build your own virtual spaces with our intuitive room builder",
        color: "from-pink-500 to-pink-700"
    },
    {
        icon: "👥",
        title: "Real-time Collaboration",
        description: "Work together seamlessly with live cursor tracking and instant updates",
        color: "from-green-500 to-green-700"
    },
    {
        icon: "🔒",
        title: "Secure & Private",
        description: "End-to-end encryption ensures your conversations stay private",
        color: "from-orange-500 to-orange-700"
    },
    {
        icon: "⚡",
        title: "Lightning Fast",
        description: "Optimized performance for smooth interactions across all devices",
        color: "from-blue-500 to-blue-700"
    }
]

export const Features = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <section id="features" className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:50px_50px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80 mb-6">
                        <span>✨ Features</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                        Everything You Need
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Powerful features designed to enhance your virtual collaboration experience
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Glow Effect */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-300`}></div>
                            
                            {/* Card */}
                            <div className="relative bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:bg-gray-800/50 transition-all duration-300">
                                {/* Icon */}
                                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                
                                {/* Content */}
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                    {feature.description}
                                </p>

                                {/* Hover Arrow */}
                                <div className={`mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform ${hoveredIndex === index ? 'translate-x-0' : 'translate-x-2'}`}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}