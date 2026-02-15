"use client"

import Image from 'next/image'
import Logo from '@/assests/logosaas.png'

export const Footer = () => {
    return (
        <footer className="bg-neutral-950 border-t border-neutral-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="flex items-center gap-2.5">
                        <Image src={Logo} alt='NexRoom' height={24} width={24} className="rounded-full" />
                        <span className="text-sm font-semibold text-white tracking-tight">NexRoom</span>
                    </div>

                    <div className="flex flex-wrap gap-8 text-sm">
                        <a href="#features" className="text-neutral-500 hover:text-white transition-colors">Features</a>
                        <a href="#about" className="text-neutral-500 hover:text-white transition-colors">About</a>
                        <a href="#" className="text-neutral-500 hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-neutral-500 hover:text-white transition-colors">Terms</a>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-neutral-900">
                    <p className="text-neutral-600 text-xs">
                        © {new Date().getFullYear()} NexRoom. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}