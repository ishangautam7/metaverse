"use client"

import ArrowRight from '@/assests/arrow-right.svg'
import Logo from '@/assests/logosaas.png'
import Image from 'next/image'
import MenuIcon from '@/assests/menu.svg'
import Cross from '@/assests/cross.svg'
import { useState } from 'react'
import { Login } from './Login'

export const Header = () => {

    const [isClosed, setIsClosed] = useState(false)
    const [openLogin, setOpenLogin] = useState(false)
    const [openRegister, setOpenRegister] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    return (
        <header className='sticky top-0 z-50'>
            <div className={`flex justify-center items-center py-3 gap-3 bg-black text-white text-small relative w-full ${isClosed ? 'hidden' : 'block'}`}>
                <p className='text-white/60 hidden md:block'> Beyond the screen but always connected. </p>
                <div className='inline-flex gap-1 items-center'>
                    <p>Try for Free</p>
                    <ArrowRight className='h-4 w-4 inline-flex justify-center items-center' />
                </div>

                <div className="absolute right-0">
                    <Cross className='h-4 w-4 mx-2' onClick={() => { setIsClosed(!isClosed) }} />
                </div>
            </div>

            <div className='py-5'>
                <div className='w-full px-4 mx-auto max-w-7xl'>
                    <div className='flex items-center justify-between'>
                        <Image src={Logo} alt='logo' height={40} width={40} />
                        <MenuIcon className='h-5 w-5 md:hidden'  onClick={() => setShowMobileMenu(!showMobileMenu)}/>
                        <nav className='hidden md:flex gap-6 text-black-60 items-center cursor-pointer'>
                            <a href="#">About</a>
                            <a href="#">Features</a>
                            <a href="#">Updates</a>
                            <a href="#">Help</a>
                            <button className='bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight' onClick={() => { setOpenLogin(!openLogin) }}>Sign In</button>
                            <button className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight' onClick={() => { setOpenRegister(!openRegister) }}>Get Started</button>
                        </nav>
                    </div>
                </div>
            </div>

            {showMobileMenu && (
                <div className="md:hidden bg-white w-full px-6 pb-6 absolute top-full left-0 shadow-lg z-40">
                    <div className='flex justify-end pt-4'>
                        <Cross className='h-5 w-5 cursor-pointer invert' onClick={() => setShowMobileMenu(false)} />
                    </div>
                    <div className='flex flex-col gap-4 mt-4 text-black'>
                        <a href="#" className='text-base'>About</a>
                        <a href="#" className='text-base'>Features</a>
                        <a href="#" className='text-base'>Updates</a>
                        <a href="#" className='text-base'>Help</a>
                        <button className='bg-black text-white px-4 py-2 rounded-lg font-medium tracking-tight' onClick={() => { setOpenLogin(true); setShowMobileMenu(false); }}>Sign In</button>
                        <button className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium tracking-tight' onClick={() => { setOpenRegister(true); setShowMobileMenu(false); }}>Get Started</button>
                    </div>
                </div>
            )}

            {openLogin && <Login onClose={() => setOpenLogin(!openLogin)} />}
        </header>
    )
}
