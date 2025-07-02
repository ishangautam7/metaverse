import Image from "next/image"
import Link from "next/link"
import DefaultImage from "@/assests/defaultmale.png"
import { useRouter } from "next/navigation"

type NavbarProps = {
    dropdownOpen: boolean,
    setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const NavBar = ({dropdownOpen, setDropdownOpen}: NavbarProps) => {
    const profileImg = DefaultImage
    const router = useRouter()
    
    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-black/60 backdrop-blur-lg border-b border-white/10 shadow-xl relative z-50">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-sm opacity-75"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    NexRoom
                </h1>
            </div>

            {/* Profile Section */}
            <div className="relative">
                <div 
                    className="group cursor-pointer flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                        <Image 
                            src={profileImg} 
                            alt="Profile" 
                            width={32} 
                            height={32} 
                            className="relative rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all" 
                        />
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-white text-sm font-medium">
                            {JSON.parse(localStorage.getItem("user") || "{}").username || "User"}
                        </div>
                        <div className="text-gray-400 text-xs">Dashboard</div>
                    </div>
                    <svg 
                        className={`w-4 h-4 text-white/60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
                        <div className="px-4 py-3 border-b border-white/10">
                            <div className="text-white font-medium text-sm">
                                {JSON.parse(localStorage.getItem("user") || "{}").username || "User"}
                            </div>
                            <div className="text-gray-400 text-xs">Premium Member</div>
                        </div>
                        
                        <Link href="/profile">
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-white text-sm">Profile</span>
                            </div>
                        </Link>
                        
                        <Link href="/settings">
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-white text-sm">Settings</span>
                            </div>
                        </Link>
                        
                        <div className="border-t border-white/10 mt-2 pt-2">
                            <button 
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("userId");
                                    router.push('/');
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 cursor-pointer transition-colors w-full text-left"
                            >
                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="text-red-400 text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </nav>
    )
}

export default NavBar