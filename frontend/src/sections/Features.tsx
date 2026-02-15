"use client"

import { Video, Monitor, MessageSquare, Move, Paintbrush, Zap } from "lucide-react"

const features = [
    {
        icon: Move,
        title: "Spatial Movement",
        description: "Navigate a 2D map and walk up to colleagues — proximity determines who you hear."
    },
    {
        icon: Video,
        title: "Video & Audio",
        description: "Crystal-clear calls that start automatically when you're near someone. No links needed."
    },
    {
        icon: Monitor,
        title: "Screen Sharing",
        description: "Share your screen with nearby teammates instantly. Great for pair programming."
    },
    {
        icon: MessageSquare,
        title: "Live Chat",
        description: "Send quick messages to anyone in the room without interrupting their flow."
    },
    {
        icon: Paintbrush,
        title: "Custom Rooms",
        description: "Design your own office layout. Add desks, meeting areas, and lounges."
    },
    {
        icon: Zap,
        title: "Low Latency",
        description: "Optimized WebRTC connections keep everything fast across any device."
    }
]

export const Features = () => {
    return (
        <section id="features" className="py-24 bg-neutral-950 border-t border-neutral-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-sm text-neutral-500 uppercase tracking-wide mb-3">Features</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Everything your team needs
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800 rounded-xl overflow-hidden border border-neutral-800">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-neutral-950 p-8 hover:bg-neutral-900/50 transition-colors"
                        >
                            <feature.icon className="w-5 h-5 text-neutral-400 mb-4" />
                            <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}