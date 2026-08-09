import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-slate-950 text-white overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[120px] mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px] mix-blend-screen pointer-events-none"></div>
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                
                <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-12">
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            v2.0 is now live
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            AI Powered <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">Campus Placement Portal</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                            Empowering students with AI-driven resume analysis, interview preparation, and real-time placement analytics to secure their dream careers.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
                            <Link to="/companies" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] flex items-center justify-center gap-2">
                                Explore Companies
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </Link>
                            <Link to="/eligibility" className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium rounded-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2">
                                Check Eligibility
                            </Link>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="relative w-full max-w-lg">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 blur-3xl opacity-20 animate-pulse"></div>
                            <svg className="w-full relative z-10 drop-shadow-2xl" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="500" height="400" rx="24" fill="url(#paint0_linear)" stroke="url(#paint1_linear)" strokeWidth="2"/>
                                <circle cx="250" cy="200" r="120" fill="url(#paint2_linear)" className="animate-pulse" style={{animationDuration: '4s'}}/>
                                <path d="M180 220 L230 270 L320 150" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
                                <defs>
                                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="500" y2="400" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#1E1B4B" stopOpacity="0.8"/>
                                        <stop offset="1" stopColor="#312E81" stopOpacity="0.8"/>
                                    </linearGradient>
                                    <linearGradient id="paint1_linear" x1="0" y1="0" x2="500" y2="400" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#6366F1" stopOpacity="0.5"/>
                                        <stop offset="1" stopColor="#A855F7" stopOpacity="0.1"/>
                                    </linearGradient>
                                    <linearGradient id="paint2_linear" x1="130" y1="80" x2="370" y2="320" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#4F46E5"/>
                                        <stop offset="1" stopColor="#9333EA"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-16 -mt-12 relative z-20 container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Total Companies", value: "500+", icon: <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> },
                        { title: "Highest Package", value: "50 LPA", icon: <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
                        { title: "Placement Resources", value: "10K+", icon: <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> },
                        { title: "AI Powered", value: "100%", icon: <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex items-center justify-between transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 group">
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">{stat.title}</p>
                                <h3 className="text-3xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{stat.value}</h3>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">{stat.icon}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white container mx-auto px-6 lg:px-12">
                <div className="text-center mb-20">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Powerful Features</h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">Everything you need to land your dream job, all in one seamless platform.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { title: "Companies", desc: "Discover and apply to top-tier organizations actively hiring.", icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>, link: "/companies", color: "from-blue-500 to-indigo-600" },
                        { title: "Eligibility Checker", desc: "Instantly check your eligibility for upcoming placement drives.", icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, link: "/eligibility", color: "from-emerald-400 to-teal-500" },
                        { title: "Resume Analyzer", desc: "AI-driven insights to optimize your resume and stand out.", icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>, link: "/resume-analyzer", color: "from-purple-500 to-pink-500" },
                        { title: "Interview Experiences", desc: "Learn from real interview experiences shared by your peers.", icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>, link: "/interview-experiences", color: "from-orange-400 to-red-500" }
                    ].map((feature, idx) => (
                        <Link to={feature.link} key={idx} className="bg-gray-50 rounded-3xl p-8 hover:bg-white transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-transparent hover:border-gray-100 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-light">{feature.desc}</p>
                            <div className="mt-6 flex items-center text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                Explore
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* About & Connect Section */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 mix-blend-multiply"></div>
                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="bg-white rounded-[2.5rem] p-10 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="lg:w-1/2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold tracking-wide uppercase mb-6">
                                Developer
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">About The Creator</h2>
                            <div className="space-y-4 text-lg text-gray-600">
                                <p className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">👤</span>
                                    <span className="font-medium text-gray-900">Virendra Joshi</span>
                                </p>
                                <p className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">🎓</span>
                                    <span>B.Tech CSE Student</span>
                                </p>
                                <p className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">💻</span>
                                    <span>Passionate Full Stack Developer</span>
                                </p>
                                <p className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">📍</span>
                                    <span>Jaipur, Rajasthan</span>
                                </p>
                            </div>
                        </div>
                        <div className="lg:w-1/2 flex flex-col items-center lg:items-end w-full">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center lg:text-right">Let's Connect</h2>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <a href="https://in.linkedin.com/in/virendra-joshi-668b8b288" target="_blank" rel="noopener noreferrer" className="group px-6 py-4 bg-[#0A66C2] hover:bg-[#004182] text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3 w-full sm:w-auto">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    LinkedIn
                                </a>
                                <a href="https://github.com/virendra13joshi-web" target="_blank" rel="noopener noreferrer" className="group px-6 py-4 bg-[#24292F] hover:bg-black text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3 w-full sm:w-auto">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                    GitHub
                                </a>
                                <a href="https://www.instagram.com/virendrakuchtogadbadhai/" target="_blank" rel="noopener noreferrer" className="group px-6 py-4 bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] hover:opacity-90 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3 w-full sm:w-auto">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                    Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 mt-auto relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                        <span className="text-xl font-bold text-white tracking-tight">CareerCompass <span className="text-indigo-500">AI</span></span>
                        <p className="mt-2 text-sm text-slate-500">Empowering student careers.</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm font-medium mb-1">© 2026 CareerCompass AI.</p>
                        <p className="text-xs text-slate-500">Designed & Developed by <span className="text-slate-300 font-semibold">Virendra Joshi</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;