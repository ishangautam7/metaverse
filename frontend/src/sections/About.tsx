"use client"

export const About = () => {
    return (
        <section id="about" className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80">
                            <span> About NexRoom</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                            Redefining Virtual Collaboration
                        </h2>
                        
                        <p className="text-xl text-gray-300 leading-relaxed">
                            NexRoom isn't just another video conferencing tool. It's a complete virtual environment where teams can truly collaborate, create, and connect in ways that feel natural and engaging.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Immersive Experience</h3>
                                    <p className="text-gray-400">Move freely through virtual spaces that feel alive and responsive</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Built for Teams</h3>
                                    <p className="text-gray-400">Designed from the ground up for seamless team collaboration</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Always Evolving</h3>
                                    <p className="text-gray-400">Regular updates and new features based on community feedback</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Stats & Visual */}
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                    99.9%
                                </div>
                                <div className="text-sm text-gray-400">Uptime</div>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                    &lt;50ms
                                </div>
                                <div className="text-sm text-gray-400">Latency</div>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                    10K+
                                </div>
                                <div className="text-sm text-gray-400">Active Users</div>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                    24/7
                                </div>
                                <div className="text-sm text-gray-400">Support</div>
                            </div>
                        </div>

                        {/* Visual Element */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
                            <div className="relative bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🌟</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Join the Revolution</h3>
                                    <p className="text-gray-400 mb-6">Be part of the future of virtual collaboration</p>
                                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium rounded-full hover:from-purple-700 hover:to-cyan-600 transition-all">
                                        Get Early Access
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