"use client"

import { useRouter } from "next/navigation"

export const About = () => {
    const router = useRouter()

    return (
        <section id="about" className="py-24 bg-neutral-950 border-t border-neutral-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-sm text-neutral-500 uppercase tracking-wide mb-3">About</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
                        Built for how teams actually work
                    </h2>
                    <p className="text-neutral-400 leading-relaxed mb-4">
                        Traditional video calls are rigid — you schedule them, join a link, and stare at a grid of faces. That&apos;s not how real offices work.
                    </p>
                    <p className="text-neutral-400 leading-relaxed mb-4">
                        In a real office, you overhear a conversation and join in. You walk to someone&apos;s desk for a quick question. Collaboration is spontaneous.
                    </p>
                    <p className="text-neutral-400 leading-relaxed mb-8">
                        NexRoom brings that back. Your team gets a persistent 2D space where everyone has an avatar. Walk up to someone to start talking — no scheduling, no friction.
                    </p>

                    <button
                        onClick={() => router.push('/register')}
                        className="px-5 py-2.5 bg-white text-neutral-900 font-medium rounded-md hover:bg-neutral-200 transition-colors text-sm"
                    >
                        Try NexRoom free →
                    </button>
                </div>
            </div>
        </section>
    )
}