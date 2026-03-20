"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Eye, EyeOff, Github } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 grid-pattern">
            {/* Glow */}
            <div
                className="hero-glow bg-violet-700 top-1/2 left-1/2 opacity-25"
                style={{ transform: "translate(-50%, -50%)" }}
            />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">
                            File<span className="gradient-text">Forge</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">
                        {isLogin ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-[#9090b0] mt-2 text-sm">
                        {isLogin
                            ? "Sign in to access your dashboard and history."
                            : "Join 180,000+ users converting files daily."}
                    </p>
                </div>

                <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/50">
                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-6">
                        <button className="w-full flex items-center justify-center gap-3 glass border border-white/[0.12] rounded-xl py-3 text-white text-sm font-medium hover:bg-white/[0.08] transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 glass border border-white/[0.12] rounded-xl py-3 text-white text-sm font-medium hover:bg-white/[0.08] transition-all">
                            <Github className="w-5 h-5" />
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-white/[0.08]" />
                        <span className="text-[#9090b0] text-xs">or with email</span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="text-[#9090b0] text-xs font-medium block mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-[#9090b0] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[#9090b0] text-xs font-medium block mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-[#9090b0] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[#9090b0] text-xs font-medium">Password</label>
                                {isLogin && (
                                    <a href="#" className="text-violet-400 text-xs hover:text-violet-300 transition-colors">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full glass rounded-xl px-4 py-3 pr-12 text-white placeholder-[#9090b0] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9090b0] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-xl shadow-violet-900/40 text-sm"
                        >
                            {isLogin ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center text-[#9090b0] text-sm mt-6">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                        >
                            {isLogin ? "Sign up free" : "Sign in"}
                        </button>
                    </p>
                </div>

                <p className="text-center text-[#9090b0] text-xs mt-6">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-violet-400 hover:underline">Terms of Service</a> and{" "}
                    <a href="#" className="text-violet-400 hover:underline">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
