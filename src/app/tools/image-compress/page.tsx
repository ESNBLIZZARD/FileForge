"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    ArrowLeft, 
    Upload, 
    FileImage, 
    X, 
    Loader2, 
    Download, 
    RefreshCw, 
    Sliders,
    Zap,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingDown,
    ChevronRight,
    Minimize2
} from "lucide-react";
import { tools } from "@/lib/tools";
import ToolCard from "@/components/tools/ToolCard";
import imageCompression from "browser-image-compression";

export default function ImageCompressPage() {
    const [file, setFile] = useState<File | null>(null);
    const [quality, setQuality] = useState(0.8);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{ original: number; compressed: number } | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
            setStats(null);
            setDownloadUrl(null);
        } else if (selectedFile) {
            setError("Please upload a valid image file (JPG, PNG, WebP).");
        }
    };

    const compressImage = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const options = {
                maxSizeMB: 10,
                maxWidthOrHeight: 4096,
                useWebWorker: true,
                initialQuality: quality,
            };

            const compressedFile = await imageCompression(file, options);
            
            const url = URL.createObjectURL(compressedFile);
            setDownloadUrl(url);
            setStats({
                original: file.size,
                compressed: compressedFile.size
            });

        } catch (err: any) {
            console.error("Compression error:", err);
            setError("Failed to compress image. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setQuality(0.8);
        setStats(null);
        setError(null);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setDownloadUrl(null);
        setPreviewUrl(null);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const savings = stats ? Math.max(0, Math.round(((stats.original - stats.compressed) / stats.original) * 100)) : 0;

    const relatedTools = tools
        .filter((t) => t.category === "image-utilities" && t.id !== "image-compress")
        .slice(0, 4);

    return (
        <div className="min-h-screen pt-24 pb-24 px-4">
            <div className="max-w-5xl mx-auto">
                <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 text-[#9090b0] hover:text-white text-sm mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    All Tools
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-900/20 flex-shrink-0 animate-in zoom-in-50 duration-500">
                            <Minimize2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Compress Image</h1>
                            <p className="text-[#9090b0] text-lg leading-relaxed max-w-2xl text-left">
                                Reduce image file size without losing quality. Perfect for web usage.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {!file ? (
                            <div className="glass rounded-3xl p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors" />
                                <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 transition-all hover:border-blue-500/30 hover:bg-white/[0.02] group/upload">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/png,image/webp"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-500">
                                            <Upload className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-lg">Select Image</p>
                                            <p className="text-[#9090b0] text-sm mt-1">Supports JPG, PNG, and WebP</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                                <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileImage className="w-5 h-5 text-blue-400" />
                                        <span className="text-white font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-[#9090b0] text-xs">({formatSize(file.size)})</span>
                                    </div>
                                    <button onClick={reset} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#9090b0] hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-8 flex items-center justify-center bg-black/20">
                                    {previewUrl && (
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className="max-h-[400px] rounded-lg shadow-2xl object-contain border border-white/5" 
                                        />
                                    )}
                                </div>
                                {stats && (
                                    <div className="p-6 bg-blue-500/10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <TrendingDown className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-lg">{savings}% Reduced</p>
                                                <p className="text-[#9090b0] text-sm">Compressed to {formatSize(stats.compressed)}</p>
                                            </div>
                                        </div>
                                        <a 
                                            href={downloadUrl!} 
                                            download={`compressed_${file.name}`}
                                            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="glass rounded-3xl p-6 border border-white/10 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Sliders className="w-5 h-5 text-blue-400" />
                                <h3 className="text-white font-bold">Compression Settings</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-3 text-sm">
                                        <span className="text-[#9090b0]">Quality Level</span>
                                        <span className="text-blue-400 font-bold">{Math.round(quality * 100)}%</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.05"
                                        value={quality}
                                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                                        className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] text-[#505070] uppercase tracking-wider font-bold">
                                        <span>Small Size</span>
                                        <span>Perfect Quality</span>
                                    </div>
                                </div>

                                <button
                                    onClick={compressImage}
                                    disabled={!file || isProcessing}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    )}
                                    {isProcessing ? "Compressing..." : "Compress Now"}
                                </button>
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
                            <h4 className="text-white font-bold text-sm">Why use our compressor?</h4>
                            <div className="space-y-3">
                                {[
                                    { icon: Shield, text: "Private: Processing is 100% local", color: "text-green-400" },
                                    { icon: Clock, text: "Fast: Lightning quick results", color: "text-blue-400" },
                                    { icon: CheckCircle2, text: "Smart: Balance quality & size", color: "text-purple-400" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-[#9090b0]">
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-24">
                        <h2 className="text-2xl font-bold text-white mb-8 text-left border-l-4 border-blue-500 pl-4">Continue Editing</h2>
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
