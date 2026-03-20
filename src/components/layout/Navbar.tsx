"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap, Menu, X, ChevronDown } from "lucide-react";

const navTools = [
    { label: "PDF Tools", href: "/tools?cat=pdf" },
    { label: "PDF Utilities", href: "/tools?cat=pdf-utilities" },
    { label: "Image Tools", href: "/tools?cat=image" },
    { label: "Audio & Video", href: "/tools?cat=audio" },
    { label: "Data & Dev", href: "/tools?cat=data" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

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
                                <div className="absolute top-full left-0 mt-1 w-52 glass rounded-xl py-2 shadow-2xl shadow-black/50">
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
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
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
                            Get Started Free
                        </Link>
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
                <div className="md:hidden bg-[#06060f]/95 backdrop-blur-xl border-t border-white/[0.06]">
                    <div className="px-4 py-4 space-y-1">
                        {navTools.map((t) => (
                            <Link
                                key={t.label}
                                href={t.href}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2.5 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm"
                            >
                                {t.label}
                            </Link>
                        ))}
                        <Link
                            href="/pricing"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2.5 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/dashboard"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2.5 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.06] transition-all text-sm"
                        >
                            Dashboard
                        </Link>
                        <div className="pt-3 flex flex-col gap-2">
                            <Link
                                href="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2.5 text-center text-sm font-medium text-white border border-white/[0.12] rounded-lg hover:bg-white/[0.06] transition-all"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-lg"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
