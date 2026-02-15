import Image from "next/image"
import Link from "next/link"
import DefaultImage from "@/assests/defaultmale.png"
import { useRouter } from "next/navigation"
import { ChevronDown, User, LogOut } from "lucide-react"

type NavbarProps = {
    dropdownOpen: boolean,
    setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const NavBar = ({ dropdownOpen, setDropdownOpen }: NavbarProps) => {
    const profileImg = DefaultImage
    const router = useRouter()

    return (
        <nav className="flex justify-between items-center px-6 py-3 bg-neutral-950 border-b border-neutral-800 relative z-50">
            <div className="flex items-center gap-2.5">
                <span className="text-lg font-semibold text-white tracking-tight">NexRoom</span>
            </div>

            <div className="relative">
                <button
                    className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <Image
                        src={profileImg}
                        alt="Profile"
                        width={28}
                        height={28}
                        className="rounded-full border border-neutral-700"
                    />
                    <span className="hidden sm:block">
                        {(() => {
                            try {
                                const user = JSON.parse(localStorage.getItem("user") || "{}");
                                return typeof user === 'object' && user?.username && typeof user.username === 'string' ? user.username : "User";
                            } catch {
                                return "User";
                            }
                        })()}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-lg py-1 z-50">
                        <Link href="/profile">
                            <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                                <User className="w-3.5 h-3.5" />
                                Profile
                            </div>
                        </Link>

                        <div className="border-t border-neutral-800 my-1" />

                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("userId");
                                router.push('/');
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-neutral-800 transition-colors w-full text-left"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar