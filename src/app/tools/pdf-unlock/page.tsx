"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    ArrowLeft, 
    Unlock, 
    Upload, 
    FileText, 
    X, 
    Loader2, 
    Download, 
    RefreshCw, 
    ShieldCheck, 
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { tools } from "@/lib/tools";
import ToolCard from "@/components/tools/ToolCard";

export default function UnlockPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
        } else if (selectedFile) {
            setError("Please upload a valid PDF file.");
        }
    };

    const unlockPdf = async () => {
        if (!file || !password) return;

        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);

            const response = await fetch("/api/convert/pdf-unlock", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to unlock PDF");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setIsDone(true);
        } catch (err: any) {
            setError(err.message || "An error occurred while unlocking the PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPassword("");
        setIsDone(false);
        setError(null);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    };

    const relatedTools = tools
        .filter((t) => t.category === "pdf-utilities" && t.id !== "pdf-unlock")
        .slice(0, 4);

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

                <div className="flex items-start gap-6 mb-10 text-left">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-900/20 flex-shrink-0 animate-in zoom-in-50 duration-500">
                        <Unlock className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Unlock PDF</h1>
                        <p className="text-[#9090b0] text-lg leading-relaxed max-w-2xl text-left">
                            Remove passwords and restrictions from your PDF files instantly.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -z-10 group-hover:bg-amber-500/10 transition-colors" />
                            
                            {!isDone ? (
                                <div className="space-y-8">
                                    {!file ? (
                                        <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 transition-all hover:border-amber-500/30 hover:bg-white/[0.02] group/upload">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".pdf"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex flex-col items-center text-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-500">
                                                    <Upload className="w-8 h-8 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-lg">Select PDF file</p>
                                                    <p className="text-[#9090b0] text-sm mt-1">or drag and drop here</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group/file">
                                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-amber-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{file.name}</p>
                                                    <p className="text-[#9090b0] text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                </div>
                                                <button 
                                                    onClick={reset}
                                                    className="p-2 text-[#9090b0] hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                                <div>
                                                    <label className="text-xs font-bold text-[#9090b0] uppercase tracking-wider mb-2 block text-left">Enter PDF Password</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090b0]" />
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="Password of the file..."
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
                                                        />
                                                        <button
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#9090b0] hover:text-white transition-colors"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {error && (
                                                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake-in">
                                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                                        <p className="text-red-400 text-sm leading-relaxed text-left">{error}</p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={unlockPdf}
                                                    disabled={!password || isProcessing}
                                                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                                                        password && !isProcessing
                                                            ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-xl shadow-amber-900/40 translate-y-0 active:translate-y-0.5"
                                                            : "bg-white/5 text-[#9090b0] cursor-not-allowed"
                                                    }`}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Unlocking PDF...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Unlock className="w-5 h-5" />
                                                            Unlock PDF Now
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center relative">
                                        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-white font-bold text-3xl tracking-tight">PDF Unlocked!</h3>
                                        <p className="text-[#9090b0]">Password protection has been successfully removed.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                        <a
                                            href={downloadUrl!}
                                            download={`unlocked_${file!.name}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-xl shadow-amber-900/40"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download PDF
                                        </a>
                                        <button
                                            onClick={reset}
                                            className="flex items-center justify-center gap-2 px-6 py-4 glass text-[#9090b0] hover:text-white rounded-xl transition-all font-semibold"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            New File
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                                </div>
                                <h4 className="text-white font-semibold mb-2 text-left">100% Secure</h4>
                                <p className="text-[#9090b0] text-sm leading-relaxed text-left">
                                    Your files are processed securely and automatically deleted immediately after downloading.
                                </p>
                            </div>
                            <div className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors text-left">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                                    <Unlock className="w-5 h-5 text-violet-400" />
                                </div>
                                <h4 className="text-white font-semibold mb-2 text-left">Remove Restrictions</h4>
                                <p className="text-[#9090b0] text-sm leading-relaxed text-left">
                                    Eliminate printing, copying, and editing restrictions from protected documents.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass rounded-3xl p-6 border border-white/10 space-y-6 text-left">
                            <h3 className="text-white font-bold text-lg text-left">How to Unlock</h3>
                            <div className="space-y-4">
                                {[
                                    { step: "1", text: "Upload your password-protected PDF." },
                                    { step: "2", text: "Enter the correct password for the file." },
                                    { step: "3", text: "Click 'Unlock PDF Now' to process." },
                                    { step: "4", text: "Download your unencrypted file instantly." }
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold flex items-center justify-center shrink-0">
                                            {item.step}
                                        </span>
                                        <p className="text-[#9090b0] text-sm">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-amber-500/5 to-transparent text-left">
                            <h3 className="text-white font-bold text-lg mb-4 text-left">Privacy First</h3>
                            <p className="text-[#9090b0] text-sm leading-relaxed text-left">
                                We prioritize your document security. Our server only processes your files for the moment needed to unlock them, with zero persistent storage.
                            </p>
                        </div>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-white mb-8 text-left">More PDF Utilities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
