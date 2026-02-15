"use client"
import { useRouter } from "next/navigation"
import { Video, Monitor, MessageSquare, Shield, Zap, Users, ArrowRight } from "lucide-react"

export const About = () => {
    const router = useRouter()

    const handleEarlyAccess = () => {
        router.push('/register')
    }

    return (
        <section id="about" className="py-32 bg-gray-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">

                    {/* Left Content */}
                    <div className="flex-1 space-y-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-purple-300 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                <span>The Future of Work</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                                Workspace that <br />
                                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    feels familiar
                                </span>
                            </h2>

                            <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                                Forget static video grids. NexRoom brings the spontaneity of physical offices to the digital world with spatial audio and interactive environments.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {[
                                {
                                    title: "Spatial Audio & Video",
                                    description: "Hear people get louder as you walk closer, just like real life.",
                                    icon: <Users className="w-5 h-5 text-purple-400" />
                                },
                                {
                                    title: "Interactive Collaboration",
                                    description: "Whiteboards, screen sharing, and embedded apps in one space.",
                                    icon: <Zap className="w-5 h-5 text-blue-400" />
                                },
                                {
                                    title: "Enterprise Grade Security",
                                    description: "End-to-end encryption for all your conversations and data.",
                                    icon: <Shield className="w-5 h-5 text-green-400" />
                                }
                            ].map((item, index) => (
                                <div key={index} className="flex gap-4 group">
                                    <div className="mt-1 flex-shrink-0 w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-purple-500/30 transition-colors">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">{item.title}</h3>
                                        <p className="text-gray-400 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Abstract Visual */}
                    <div className="flex-1 w-full lg:w-auto">
                        <div className="relative isolate">
                            {/* Abstract Card */}
                            <div className="relative bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 overflow-hidden">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                    <svg className="w-32 h-32 text-purple-500" viewBox="0 0 100 100" fill="currentColor">
                                        <circle cx="50" cy="50" r="50" />
                                    </svg>
                                </div>

                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div className="col-span-2 space-y-2 mb-4">
                                        <h3 className="text-2xl font-bold text-white">Platform Capabilities</h3>
                                        <p className="text-gray-400 text-sm">Everything you need to collaborate effectively.</p>
                                    </div>

                                    {/* Capability Cards */}
                                    {[
                                        { icon: Video, label: "HD Video", color: "text-blue-400", bg: "bg-blue-500/10" },
                                        { icon: Monitor, label: "Screen Share", color: "text-green-400", bg: "bg-green-500/10" },
                                        { icon: MessageSquare, label: "Live Chat", color: "text-purple-400", bg: "bg-purple-500/10" },
                                        { icon: Shield, label: "Secure", color: "text-orange-400", bg: "bg-orange-500/10" },
                                    ].map((cap, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all cursor-default group">
                                            <div className={`p-3 rounded-full ${cap.bg} group-hover:scale-110 transition-transform`}>
                                                <cap.icon className={`w-6 h-6 ${cap.color}`} />
                                            </div>
                                            <span className="text-white font-medium text-sm">{cap.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={handleEarlyAccess}
                                        className="w-full group bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Get Started Now
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}