"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Eye, EyeOff, Github, Loader2 } from "lucide-react";
import { signupSchema, loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // Login Flow
                const validation = loginSchema.safeParse({ email: form.email, password: form.password });
                if (!validation.success) {
                    setError(validation.error.issues[0].message);
                    setIsLoading(false);
                    return;
                }

                const result = await signIn("credentials", {
                    email: form.email,
                    password: form.password,
                    redirect: false
                });

                if (result?.error) {
                    setError("Invalid email or password");
                } else {
                    window.location.href = "/dashboard";
                }
            } else {
                // Signup Flow
                const validation = signupSchema.safeParse(form);
                if (!validation.success) {
                    setError(validation.error.issues[0].message);
                    setIsLoading(false);
                    return;
                }

                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form)
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Something went wrong");
                } else {
                    // Auto login after signup
                    const result = await signIn("credentials", {
                        email: form.email,
                        password: form.password,
                        redirect: false
                    });

                    if (result?.error) {
                        setError("Account created, but login failed. Please sign in manually.");
                        setIsLogin(true);
                    } else {
                        window.location.href = "/dashboard";
                    }
                }
            }
        } catch (err) {
            setError("Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        signIn(provider, { callbackUrl: "/dashboard" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 grid-pattern">
            {/* Glow */}
            <div className="hero-glow bg-violet-700 top-1/2 left-1/2 opacity-25" style={{ transform: "translate(-50%, -50%)" }} />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">
                            File<span className="gradient-text">Forge</span>
                        </span>
                    </Link>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">
                        {isLogin ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-[#9090b0] font-medium text-sm italic">
                        {isLogin ? "Access your secure workspace." : "Join thousands of processing pioneers."}
                    </p>
                </div>

                <div className="glass rounded-[2rem] p-8 sm:p-10 shadow-2xl border border-white/5 relative overflow-hidden animate-in zoom-in-95 duration-500">
                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button onClick={() => handleSocialLogin("google")} className="flex items-center justify-center gap-3 glass border border-white/10 rounded-2xl py-4 hover:bg-white/10 transition-all group">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-white text-xs font-black uppercase tracking-widest hidden sm:inline">Google</span>
                        </button>
                        <button onClick={() => handleSocialLogin("github")} className="flex items-center justify-center gap-3 glass border border-white/10 rounded-2xl py-4 hover:bg-white/10 transition-all group">
                            <Github className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            <span className="text-white text-xs font-black uppercase tracking-widest hidden sm:inline">GitHub</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[#606080] text-[10px] font-black uppercase tracking-[0.3em]">Credentials</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-tight animate-in fade-in slide-in-from-left-4">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-[#9090b0] text-[10px] font-black uppercase tracking-widest block mb-2 px-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Dominic Toretto"
                                    className="w-full glass rounded-2xl px-5 py-4 text-white placeholder-[#404060] text-sm font-medium focus:ring-2 focus:ring-violet-500/50 transition-all border border-white/5 outline-none"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[#9090b0] text-[10px] font-black uppercase tracking-widest block mb-2 px-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="pioneer@fileforge.com"
                                className="w-full glass rounded-2xl px-5 py-4 text-white placeholder-[#404060] text-sm font-medium focus:ring-2 focus:ring-violet-500/50 transition-all border border-white/5 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <label className="text-[#9090b0] text-[10px] font-black uppercase tracking-widest">Password</label>
                                {isLogin && (
                                    <a href="#" className="text-violet-400 text-[10px] font-black tracking-tighter uppercase hover:text-violet-300 transition-colors">Forgot?</a>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full glass rounded-2xl px-5 py-4 pr-14 text-white placeholder-[#404060] text-sm font-medium focus:ring-2 focus:ring-violet-500/50 transition-all border border-white/5 outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#606080] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-gradient-to-br from-violet-600 to-indigo-700 hover:scale-[1.01] active:translate-y-0.5 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-indigo-900/40 tracking-tighter italic flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? "PROCEED TO FORGE" : "INITIALIZE ACCOUNT"}
                        </button>
                    </form>

                    <p className="text-center text-[#9090b0] text-sm mt-8 font-medium">
                        {isLogin ? "New to the forge? " : "Already forged an account? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="text-violet-400 hover:text-white font-black italic transition-colors"
                        >
                            {isLogin ? "Register Core" : "Access Logic"}
                        </button>
                    </p>
                </div>
            </div>
            <style jsx>{` .glass { background: rgba(15, 15, 25, 0.4); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.05); } `}</style>
        </div>
    );
}
