"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Upload,
    File,
    CheckCircle2,
    AlertCircle,
    Download,
    Loader2,
    Shield,
    Lock,
    Eye,
    EyeOff,
    Zap,
} from "lucide-react";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";

type ConversionState = "idle" | "processing" | "done" | "error";

export default function PdfProtectPage() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "pdf-utilities" && t.id !== "pdf-protect")
        .slice(0, 4);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];
        if (selected.type !== "application/pdf") {
            setErrorMsg("Please select a valid PDF file.");
            return;
        }
        setFile(selected);
        setErrorMsg(null);
        setConvState("idle");
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    }, [downloadUrl]);

    const protectPdf = async () => {
        if (!file || !password) return;
        setConvState("processing");
        setProgress(20);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);

            setProgress(40);

            const response = await fetch("/api/convert/pdf-protect", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to protect PDF.");
            }

            setProgress(80);

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");
        } catch (err: unknown) {
            console.error("Protection failed:", err);
            const message = err instanceof Error ? err.message : "An unexpected error occurred.";
            setErrorMsg(message);
            setConvState("error");
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-24 px-4">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 text-[#9090b0] hover:text-white text-sm mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    All Tools
                </Link>

                <div className="flex items-start gap-6 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl flex-shrink-0">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Protect PDF</h1>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">
                            Encrypt your PDF with a strong password. 
                            Secure server-side processing with instant deletion.
                        </p>
                    </div>
                </div>

                <div className="max-w-xl mx-auto">
                    <div className="glass rounded-2xl p-6 sm:p-8">
                        {(convState === "idle" || convState === "error") && (
                            <div className="space-y-6">
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                                    onClick={() => inputRef.current?.click()}
                                    className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${dragging
                                            ? "border-green-500 bg-green-600/10 scale-[1.01]"
                                            : file
                                                ? "border-green-500/50 bg-green-600/5"
                                                : "border-white/[0.12] bg-white/[0.02] hover:border-green-500/50 hover:bg-green-600/5"
                                        }`}
                                >
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={(e) => handleFiles(e.target.files)}
                                    />

                                    {file ? (
                                        <div className="flex flex-col items-center gap-3 w-full text-center">
                                            <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                                                <File className="w-6 h-6 text-green-400" />
                                            </div>
                                            <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-green-600/20 flex items-center justify-center">
                                                <Upload className="w-7 h-7 text-green-400" />
                                            </div>
                                            <p className="text-white font-semibold">Select PDF file</p>
                                        </>
                                    )}
                                </div>

                                {file && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2">
                                        <div>
                                            <label className="text-xs font-bold text-[#9090b0] uppercase tracking-wider mb-2 block">Set Open Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090b0]" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Enter password..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white text-sm focus:outline-none focus:border-green-500/50 transition-all shadow-inner"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#9090b0] hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={protectPdf}
                                            disabled={!password}
                                            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${password
                                                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-xl shadow-green-900/40"
                                                    : "bg-white/5 text-[#9090b0] cursor-not-allowed"
                                                }`}
                                        >
                                            Protect PDF Now
                                        </button>
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <p className="text-red-300 text-xs leading-relaxed">{errorMsg}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {convState === "processing" && (
                            <div className="py-12 flex flex-col items-center gap-8">
                                <div className="relative w-32 h-32">
                                    <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
                                    <svg className="absolute inset-0 w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                                        <circle
                                            cx="64" cy="64" r="58"
                                            stroke="#10b981"
                                            strokeWidth="6"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 58}`}
                                            strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                                            style={{ transition: "stroke-dashoffset 0.4s ease" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col text-green-400">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span className="text-white text-base font-bold mt-2">{progress}%</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-semibold text-xl">Encrypting PDF…</p>
                                    <p className="text-[#9090b0] text-sm mt-1">Securing your document with AES-256 encryption.</p>
                                </div>
                            </div>
                        )}

                        {convState === "done" && downloadUrl && (
                            <div className="py-12 flex flex-col items-center gap-8 text-center animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-2xl shadow-green-500/10">
                                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-2xl">PDF Protected!</h3>
                                    <p className="text-[#9090b0] mt-2">The password has been successfully applied.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <button
                                        onClick={() => {
                                            const a = document.createElement("a");
                                            a.href = downloadUrl;
                                            a.download = `protected_${file?.name || "document.pdf"}`;
                                            a.click();
                                        }}
                                        className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-green-600/30 flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={() => { setFile(null); setConvState("idle"); setPassword(""); }}
                                        className="px-8 py-4 glass text-[#9090b0] hover:text-white rounded-xl font-medium transition-all"
                                    >
                                        New File
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="glass p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                            <Shield className="w-5 h-5 text-green-500 mb-2" />
                            <h4 className="text-white text-xs font-bold mb-1 uppercase tracking-tight">Security</h4>
                            <p className="text-[#9090b0] text-[10px]">AES-256 Bit Encryption</p>
                        </div>
                        <div className="glass p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                            <Zap className="w-5 h-5 text-yellow-400 mb-2" />
                            <h4 className="text-white text-xs font-bold mb-1 uppercase tracking-tight">Privacy</h4>
                            <p className="text-[#9090b0] text-[10px]">Instant Deletion</p>
                        </div>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-2xl font-bold text-white mb-8">Related Tools</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedTools.map((t, i) => (
                                <ToolCard key={t.id} tool={t} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
