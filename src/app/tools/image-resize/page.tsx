"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
    ArrowLeft, 
    Upload, 
    FileImage, 
    X, 
    Loader2, 
    Download, 
    RefreshCw, 
    Lock,
    Unlock,
    Maximize2,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    LayoutGrid,
    ChevronRight,
    MoveRight
} from "lucide-react";
import { tools } from "@/lib/tools";
import ToolCard from "@/components/tools/ToolCard";

export default function ImageResizePage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
    const [newWidth, setNewWidth] = useState<string>("");
    const [newHeight, setNewHeight] = useState<string>("");
    const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setError(null);
            setDownloadUrl(null);

            const img = new Image();
            img.onload = () => {
                setOriginalDimensions({ width: img.width, height: img.height });
                setNewWidth(img.width.toString());
                setNewHeight(img.height.toString());
            };
            img.src = url;
        } else if (selectedFile) {
            setError("Please upload a valid image file.");
        }
    };

    const handleWidthChange = (val: string) => {
        setNewWidth(val);
        if (aspectRatioLocked && originalDimensions && val !== "") {
            const width = parseInt(val);
            if (!isNaN(width)) {
                const height = Math.round((width / originalDimensions.width) * originalDimensions.height);
                setNewHeight(height.toString());
            }
        }
    };

    const handleHeightChange = (val: string) => {
        setNewHeight(val);
        if (aspectRatioLocked && originalDimensions && val !== "") {
            const height = parseInt(val);
            if (!isNaN(height)) {
                const width = Math.round((height / originalDimensions.height) * originalDimensions.width);
                setNewWidth(width.toString());
            }
        }
    };

    const applyPreset = (percent: number) => {
        if (!originalDimensions) return;
        const width = Math.round(originalDimensions.width * (percent / 100));
        const height = Math.round(originalDimensions.height * (percent / 100));
        setNewWidth(width.toString());
        setNewHeight(height.toString());
    };

    const resizeImage = async () => {
        if (!file || !originalDimensions || !newWidth || !newHeight) return;

        setIsProcessing(true);
        setError(null);

        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.src = previewUrl!;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const width = parseInt(newWidth);
            const height = parseInt(newHeight);
            
            canvas.width = width;
            canvas.height = height;
            
            if (ctx) {
                // Use better scaling quality
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, width, height);
            }

            const format = file.type === "image/png" ? "image/png" : "image/jpeg";
            const dataUrl = canvas.toDataURL(format, 0.92);
            setDownloadUrl(dataUrl);

        } catch (err: any) {
            console.error("Resize error:", err);
            setError("Failed to resize image. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setOriginalDimensions(null);
        setNewWidth("");
        setNewHeight("");
        setDownloadUrl(null);
        setError(null);
    };

    const relatedTools = tools
        .filter((t) => t.category === "image-utilities" && t.id !== "image-resize")
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
                            <Maximize2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Resize Image</h1>
                            <p className="text-[#9090b0] text-lg leading-relaxed max-w-2xl text-left">
                                Change dimensions while maintaining crisp quality and aspect ratio.
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
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-500">
                                            <Upload className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-lg">Upload Image to Resize</p>
                                            <p className="text-[#9090b0] text-sm mt-1">Select image to start</p>
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
                                        {originalDimensions && (
                                            <span className="text-[#9090b0] text-xs">
                                                {originalDimensions.width} × {originalDimensions.height}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={reset} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#9090b0] hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-8 flex flex-col items-center justify-center bg-black/20 gap-8">
                                    {previewUrl && (
                                        <div className="relative group/preview">
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className="max-h-[400px] rounded-lg shadow-2xl object-contain border border-white/5" 
                                            />
                                            {downloadUrl && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-white font-bold">Resized Successfully!</p>
                                                        <p className="text-[#9090b0] text-sm">{newWidth} × {newHeight}</p>
                                                    </div>
                                                    <a 
                                                        href={downloadUrl} 
                                                        download={`resized_${file.name}`}
                                                        className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                        Download Resized
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="glass rounded-3xl p-6 border border-white/10 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Maximize2 className="w-5 h-5 text-blue-400" />
                                <h3 className="text-white font-bold">Resize Parameters</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-[#9090b0] uppercase tracking-wider font-bold mb-2 block">Width (px)</label>
                                        <input 
                                            type="number"
                                            value={newWidth}
                                            onChange={(e) => handleWidthChange(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                            placeholder="Width"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#9090b0] uppercase tracking-wider font-bold mb-2 block">Height (px)</label>
                                        <input 
                                            type="number"
                                            value={newHeight}
                                            onChange={(e) => handleHeightChange(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                            placeholder="Height"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                                    className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                                        aspectRatioLocked 
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                                        : "bg-white/5 border-white/10 text-[#9090b0] hover:text-white"
                                    }`}
                                >
                                    {aspectRatioLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    {aspectRatioLocked ? "Aspect Ratio Locked" : "Aspect Ratio Unlocked"}
                                </button>

                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-xs text-[#9090b0] font-bold uppercase tracking-widest mb-4">Quick Presets</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[25, 50, 75].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => applyPreset(p)}
                                                className="py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/5 transition-all"
                                            >
                                                {p}%
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={resizeImage}
                                    disabled={!file || isProcessing || !newWidth || !newHeight}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    )}
                                    {isProcessing ? "Resizing..." : "Resize Now"}
                                </button>
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-[#9090b0] text-sm leading-relaxed">
                                Professional-grade resampling for crystal clear results at any size.
                            </p>
                        </div>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-24">
                        <h2 className="text-2xl font-bold text-white mb-8 text-left border-l-4 border-blue-500 pl-4">Advanced Image Tools</h2>
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
