"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Login } from '../components/Login'
import { ArrowRight, MenuIcon, Cross } from '@/components/Icons'
import Logo from '@/assests/logosaas.png'

export const Header = () => {
    const [isClosed, setIsClosed] = useState(false)
    const [openLogin, setOpenLogin] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const searchparams = useSearchParams()
    const router = useRouter()

    const closeLogin = () => {
        setOpenLogin(false);
        router.replace("/", { scroll: false });
    };

    const handleLogin = () => {
        router.push("/?showLogin=true");
    }

    useEffect(() => {
        const showLogin = searchparams.get("showLogin")
        setOpenLogin(showLogin === "true")
    }, [searchparams])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'}`}>
            {!isClosed && (
                <div className='bg-purple-900 flex justify-center items-center py-3 gap-3 text-sm relative w-full'>
                    <p className='text-white/90 hidden md:block'>Experience the future of virtual collaboration</p>
                    <div className='inline-flex gap-1 items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer'>
                        <p className="text-white font-medium">Try for Free</p>
                        <ArrowRight className='h-4 w-4 text-white' />
                    </div>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all">
                        <Cross className='h-4 w-4 text-white' onClick={() => setIsClosed(true)} />
                    </button>
                </div>
            )}

            <div className='py-4'>
                <div className='max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between'>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Image src={Logo} alt='NexRoom' height={40} width={40} className="relative z-10 rounded-full" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                NexRoom
                            </span>
                        </div>

                        <MenuIcon className='h-6 w-6 md:hidden cursor-pointer text-white hover:text-purple-300 transition-colors' onClick={() => setShowMobileMenu(!showMobileMenu)} />

                        <nav className='hidden md:flex gap-8 text-white/90 items-center'>
                            <a href="#features" className="hover:text-purple-300 transition-colors font-medium">Features</a>
                            <a href="#about" className="hover:text-purple-300 transition-colors font-medium">About</a>
                            <a href="#pricing" className="hover:text-purple-300 transition-colors font-medium">Pricing</a>
                            <a href="#contact" className="hover:text-purple-300 transition-colors font-medium">Contact</a>

                            <div className="flex items-center gap-3">
                                <button
                                    className='px-6 py-2 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm'
                                    onClick={handleLogin}
                                >
                                    Sign In
                                </button>
                                <Link href="/register">
                                    <button className='px-6 py-2 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all shadow-lg'>
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>

            {showMobileMenu && (
                <div className="md:hidden bg-black/95 backdrop-blur-lg w-full px-4 pb-6 absolute top-full left-0 shadow-2xl border-b border-white/10">
                    <div className='flex justify-end pt-4'>
                        <Cross className='h-5 w-5 cursor-pointer text-white hover:text-red-400 transition-colors' onClick={() => setShowMobileMenu(false)} />
                    </div>
                    <div className='flex flex-col gap-6 mt-6'>
                        <a href="#features" className='text-lg text-white hover:text-purple-300 transition-colors'>Features</a>
                        <a href="#about" className='text-lg text-white hover:text-purple-300 transition-colors'>About</a>
                        <a href="#pricing" className='text-lg text-white hover:text-purple-300 transition-colors'>Pricing</a>
                        <a href="#contact" className='text-lg text-white hover:text-purple-300 transition-colors'>Contact</a>

                        <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
                            <button
                                className='w-full py-3 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-all'
                                onClick={() => { handleLogin(); setShowMobileMenu(false) }}
                            >
                                Sign In
                            </button>
                            <Link href="/register">
                                <button
                                    className='w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium hover:from-purple-700 hover:to-cyan-600 transition-all'
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {openLogin && <Login onClose={closeLogin} />}
        </header>
    )
}