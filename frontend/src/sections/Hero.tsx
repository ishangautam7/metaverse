"use client"

import { useRouter } from "next/navigation"

export const Hero = () => {
    const router = useRouter()

    return (
        <section className="relative min-h-screen flex items-center justify-center bg-neutral-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-32 pb-20">
                <p className="text-sm text-neutral-500 mb-6 tracking-wide uppercase">Virtual Workspaces for Teams</p>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                    Work together,<br />anywhere.
                </h1>

                <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl mx-auto">
                    NexRoom is a persistent 2D workspace where your team can move, talk, and collaborate — like being in the same room.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <button
                        onClick={() => router.push('/register')}
                        className="px-6 py-3 bg-white text-neutral-900 font-medium rounded-md hover:bg-neutral-200 transition-colors text-sm"
                    >
                        Get started — it&apos;s free
                    </button>
                    <a href="#features" className="text-sm text-neutral-500 hover:text-white transition-colors px-6 py-3">
                        See how it works →
                    </a>
                </div>
            </div>
        </section>
    )
}