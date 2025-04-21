import HeroImage from "@/assests/hero.png"
import Image from "next/image"
export const Hero = () => {
    return (
        <section className="bg-black text-white min-h-[calc(100vh-8rem)] flex items-center justify-center py-20">
            <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-10">

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                        Welcome to <span className="text-white">NexRoom</span>
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-md mx-auto md:mx-0">
                        Step into the future of interaction. Your 2D Metaverse playground — simple, elegant, immersive.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition">
                            Get Started
                        </button>
                        <button className="border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition">
                            Learn More
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex justify-center md:justify-end w-full">
                    <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-96 md:h-96 border-2 border-white rounded-xl overflow-hidden">
                        <Image
                            src={HeroImage}
                            alt="2D Metaverse Mockup"
                            className="object-cover w-full h-full"
                            width={400}
                            height={400}
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}