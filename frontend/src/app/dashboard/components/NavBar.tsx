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
        <nav className="flex justify-between items-center px-6 py-4 bg-black bg-opacity-60 shadow-md hover:shadow-xl transition-all">
            <h1 className="text-xl font-bold text-white">NexRoom</h1>
            <div className="relative">
                <Image 
                    src={profileImg} 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                    className="rounded-full cursor-pointer border-2 border-white transition-transform transform hover:scale-105" 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg py-2 z-50">
                        <Link href="/profile">
                            <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</p>
                        </Link>
                        <Link href="/settings">
                            <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</p>
                        </Link>
                        <button onClick={()=>{localStorage.removeItem("token");localStorage.removeItem("userId");router.push('/')}}>
                            <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</p>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar
