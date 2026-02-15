"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Login } from '../components/Login'
import { MenuIcon, Cross } from '@/components/Icons'
import Logo from '@/assests/logosaas.png'

export const Header = () => {
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
        <header className={`fixed top-0 w-full z-50 transition-all duration-200 ${scrolled ? 'bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800' : 'bg-transparent'}`}>
            <div className='py-4'>
                <div className='max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between'>
                        <div className="flex items-center gap-2.5">
                            <Image src={Logo} alt='NexRoom' height={28} width={28} className="rounded-full" />
                            <span className="text-lg font-semibold text-white tracking-tight">
                                NexRoom
                            </span>
                        </div>

                        <MenuIcon className='h-5 w-5 md:hidden cursor-pointer text-neutral-400 hover:text-white transition-colors' onClick={() => setShowMobileMenu(!showMobileMenu)} />

                        <nav className='hidden md:flex gap-8 text-sm items-center'>
                            <a href="#features" className="text-neutral-400 hover:text-white transition-colors">Features</a>
                            <a href="#about" className="text-neutral-400 hover:text-white transition-colors">About</a>

                            <div className="flex items-center gap-3 ml-4">
                                <button
                                    className='text-neutral-400 hover:text-white transition-colors text-sm'
                                    onClick={handleLogin}
                                >
                                    Sign in
                                </button>
                                <Link href="/register">
                                    <button className='px-4 py-1.5 rounded-md bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-200 transition-colors'>
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>

            {showMobileMenu && (
                <div className="md:hidden bg-neutral-950 w-full px-4 pb-6 absolute top-full left-0 border-b border-neutral-800">
                    <div className='flex justify-end pt-4'>
                        <Cross className='h-5 w-5 cursor-pointer text-neutral-400 hover:text-white transition-colors' onClick={() => setShowMobileMenu(false)} />
                    </div>
                    <div className='flex flex-col gap-4 mt-4'>
                        <a href="#features" className='text-neutral-400 hover:text-white transition-colors'>Features</a>
                        <a href="#about" className='text-neutral-400 hover:text-white transition-colors'>About</a>

                        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800">
                            <button
                                className='w-full py-2.5 rounded-md border border-neutral-700 text-white text-sm hover:bg-neutral-800 transition-colors'
                                onClick={() => { handleLogin(); setShowMobileMenu(false) }}
                            >
                                Sign in
                            </button>
                            <Link href="/register">
                                <button
                                    className='w-full py-2.5 rounded-md bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-200 transition-colors'
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