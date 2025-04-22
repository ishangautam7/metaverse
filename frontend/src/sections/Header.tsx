"use client"

import ArrowRight from '@/assests/arrow-right.svg'
import Logo from '@/assests/logosaas.png'
import Image from 'next/image'
import MenuIcon from '@/assests/menu.svg'
import Cross from '@/assests/cross.svg'
import { useEffect, useState } from 'react'
import { Login } from '../components/Login'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export const Header = () => {
    const [isClosed, setIsClosed] = useState(false)
    const [openLogin, setOpenLogin] = useState(false)
    const [openRegister, setOpenRegister] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)

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

    return (
        <header className='sticky top-0 z-50 text-white'>
            {!isClosed && (
                <div className='bg-black flex justify-center items-center py-3 gap-3 text-sm relative w-full'>
                    <p className='text-white/60 hidden md:block'>Beyond the screen but always connected.</p>
                    <div className='inline-flex gap-1 items-center'>
                        <p>Try for Free</p>
                        <ArrowRight className='h-4 w-4' />
                    </div>
                    <div className="absolute right-0">
                        <Cross className='h-4 w-4 mx-2' onClick={() => setIsClosed(true)} />
                    </div>
                </div>
            )}

            <div className='bg-white py-4 border-t border-white/10'>
                <div className='max-w-7xl mx-auto w-full px-2 sm:px-4'>
                    <div className='flex items-center justify-between'>
                        <Image src={Logo} alt='logo' height={40} width={40} />
                        <MenuIcon className='h-5 w-5 md:hidden cursor-pointer invert' onClick={() => setShowMobileMenu(!showMobileMenu)} />
                        <nav className='hidden md:flex gap-6 text-white/90 items-center cursor-pointer'>
                            <a href="#">About</a>
                            <a href="#">Features</a>
                            <a href="#">Updates</a>
                            <a href="#">Help</a>
                            <button className='bg-black text-white px-4 py-2 rounded-lg font-medium tracking-tight cursor-pointer' onClick={handleLogin}>Sign In</button>
                            <Link href="/register">
                                <button className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium tracking-tight cursor-pointer'>Get Started</button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            {showMobileMenu && (
                <div className="md:hidden bg-white/90 backdrop-blur-lg w-full px-4 pb-6 absolute top-full left-0 shadow-lg z-40 text-black">
                    <div className='flex justify-end pt-4'>
                        <Cross className='h-5 w-5 cursor-pointer invert' onClick={() => setShowMobileMenu(false)} />
                    </div>
                    <div className='flex flex-col gap-4 mt-4'>
                        <a href="#" className='text-base'>About</a>
                        <a href="#" className='text-base'>Features</a>
                        <a href="#" className='text-base'>Updates</a>
                        <a href="#" className='text-base'>Help</a>
                        <button className='bg-black text-white px-4 py-2 rounded-lg font-medium tracking-tight cursor-pointer' onClick={() => { handleLogin(); setShowMobileMenu(false) }}>Sign In</button>
                        <Link href="/register">
                            <button className='w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium tracking-tight cursor-pointer' onClick={() => setShowMobileMenu(false)}>Get Started</button>
                        </Link>
                    </div>
                </div>
            )}

            {openLogin && <Login onClose={closeLogin} />}
        </header>
    )
}
