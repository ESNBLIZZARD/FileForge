"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Zap, Menu, X, ChevronDown, User, LogOut, Settings, LayoutDashboard } from "lucide-react";

type SessionUserShape = {
    role?: string;
};

const navTools = [
    { label: "PDF Tools", href: "/tools?cat=pdf" },
    { label: "PDF Utilities", href: "/tools?cat=pdf-utilities" },
    { label: "Image Tools", href: "/tools?cat=image" },
    { label: "Audio & Video", href: "/tools?cat=audio" },
    { label: "Data & Dev", href: "/tools?cat=data" },
];

export default function Navbar() {
    const { data: session, status } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        if (status !== "loading") {
            console.log("Navbar Auth Status:", status, "Session User:", session?.user?.name);
        }
    }, [status, session]);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const userEmail = session?.user?.email;
    const userName = session?.user?.name || "User";
    const userImage = session?.user?.image;
    const sessionUser = session?.user as (typeof session.user & SessionUserShape) | undefined;
    const dashboardHref = sessionUser?.role === "ADMIN" ? "/admin" : "/dashboard";

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-[#06060f]/90 backdrop-blur-xl border-b border-white/[0.06]"
                    : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-shadow">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight">
                            File<span className="gradient-text">Forge</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {/* Tools Dropdown */}
                        <div
                            className="relative group"
                            onMouseEnter={() => setToolsOpen(true)}
                            onMouseLeave={() => setToolsOpen(false)}
                        >
                            <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm font-medium">
                                Tools
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            {toolsOpen && (
                                <div className="absolute top-full left-0 mt-1 w-52 glass rounded-xl py-2 shadow-2xl shadow-black/50 border border-white/5">
                                    {navTools.map((t) => (
                                        <Link
                                            key={t.label}
                                            href={t.href}
                                            className="block px-4 py-2.5 text-sm text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-colors"
                                        >
                                            {t.label}
                                        </Link>
                                    ))}
                                    <div className="border-t border-white/[0.06] mt-2 pt-2">
                                        <Link
                                            href="/tools"
                                            className="block px-4 py-2.5 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
                                        >
                                            View All Tools →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/pricing"
                            className="px-4 py-2 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm font-medium"
                        >
                            Pricing
                        </Link>
                        {status === "authenticated" && (
                            <Link
                                href={dashboardHref}
                                className="px-4 py-2 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                        )}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {status === "loading" ? (
                            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                        ) : status === "authenticated" ? (
                            <div className="relative" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
                                <button className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                    {userImage ? (
                                        <img 
                                            src={userImage} 
                                            alt={userName} 
                                            className="w-7 h-7 rounded-full object-cover" 
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <span className="text-white text-xs font-bold pr-2">{userName.split(' ')[0]}</span>
                                </button>
                                
                                {profileOpen && (
                                    <div className="absolute top-full right-0 mt-1 w-56 glass rounded-2xl py-3 shadow-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 mb-2 border-b border-white/5">
                                            <p className="text-white text-xs font-bold truncate">{userName}</p>
                                            <p className="text-[#606080] text-[10px] truncate">{userEmail}</p>
                                        </div>
                                        <Link href={dashboardHref} className="flex items-center gap-3 px-4 py-2 text-sm text-[#9090b0] hover:text-white hover:bg-white/5 transition-colors">
                                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-[#9090b0] hover:text-white hover:bg-white/5 transition-colors">
                                            <Settings className="w-4 h-4" /> Settings
                                        </Link>
                                        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-t border-white/5 mt-2 pt-2">
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-[#9090b0] hover:text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-lg hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-900/30"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-[#06060f]/95 backdrop-blur-xl border-t border-white/[0.06] animate-in slide-in-from-top-4 duration-300">
                    <div className="px-4 py-4 space-y-1">
                        {status === "authenticated" && (
                            <div className="px-4 py-4 mb-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    {userImage ? (
                                        <img 
                                            src={userImage} 
                                            alt={userName} 
                                            className="w-10 h-10 rounded-full border border-white/10" 
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-bold truncate">{userName}</p>
                                        <p className="text-[#606080] text-xs truncate">{userEmail}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {navTools.map((t) => (
                            <Link
                                key={t.label}
                                href={t.href}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2.5 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm font-bold uppercase tracking-widest"
                            >
                                {t.label}
                            </Link>
                        ))}
                        <Link
                            href="/pricing"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2.5 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm font-bold uppercase tracking-widest"
                        >
                            Pricing
                        </Link>
                        {status === "authenticated" ? (
                            <>
                                <Link
                                    href={dashboardHref}
                                    onClick={() => setMenuOpen(false)}
                                    className="block px-4 py-2.5 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm font-bold uppercase tracking-widest"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => { signOut(); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all text-sm font-black uppercase tracking-widest mt-4"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="pt-3 flex flex-col gap-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="block px-4 py-2.5 text-center text-sm font-black uppercase tracking-widest text-[#9090b0] border border-white/5 rounded-xl hover:bg-white/[0.06] transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="block px-4 py-2.5 text-center text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl shadow-lg shadow-violet-900/30"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <style jsx>{` .glass { background: rgba(15, 15, 25, 0.6); backdrop-filter: blur(40px); } `}</style>
        </header>
    );
}
