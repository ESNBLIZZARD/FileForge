"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Upload,
    File,
    X,
    CheckCircle2,
    AlertCircle,
    Download,
    RefreshCw,
    Loader2,
    Shield,
    Clock,
    Zap,
    Video,
    PackageMinus,
    Trash2,
    Settings,
} from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";

type ConversionState = "loading-ffmpeg" | "idle" | "processing" | "done" | "error";

type CompressionQuality = "balanced" | "smaller" | "extreme";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompressVideoPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("loading-ffmpeg");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [outputFilename, setOutputFilename] = useState("compressed.mp4");
    const [quality, setQuality] = useState<CompressionQuality>("balanced");
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "video" && t.id !== "compress-video")
        .slice(0, 4);

    useEffect(() => {
        const loadFfmpeg = async () => {
            try {
                const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
                const ffmpeg = new FFmpeg();
                ffmpegRef.current = ffmpeg;
                ffmpeg.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
                });
                setFfmpegLoaded(true);
                setConvState("idle");
            } catch (err) {
                setErrorMsg("Technical error: Failed to initialize compression engine.");
                setConvState("error");
            }
        };
        loadFfmpeg();
    }, []);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];
        const ext = selected.name.toLowerCase().split('.').pop();
        if (!['mp4', 'mkv', 'avi', 'mov'].includes(ext || '')) {
            setErrorMsg("Select a valid video file (MP4, MKV, AVI, MOV).");
            return;
        }
        if (selected.size > 300 * 1024 * 1024) {
            setErrorMsg("Max file size 300MB for transcoding.");
            return;
        }
        setErrorMsg(null);
        setFile(selected);
        setConvState("idle");
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    }, [downloadUrl]);

    const compress = async () => {
        if (!file || !ffmpegRef.current || !ffmpegLoaded) return;
        setConvState("processing");
        setProgress(0);

        try {
            const ffmpeg = ffmpegRef.current;
            const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
            const outputName = "output.mp4";

            await ffmpeg.writeFile(inputName, await fetchFile(file));
            
            // CRF values: 18-28 is typical. 
            // 23 = Balanced, 28 = Smaller, 32 = Extreme
            const crfValue = quality === "balanced" ? "23" : quality === "smaller" ? "28" : "32";
            
            // Using preset ultrafast/superfast as WASM is slow for encoding
            await ffmpeg.exec([
                "-i", inputName,
                "-vcodec", "libx264",
                "-crf", crfValue,
                "-preset", "ultrafast",
                "-acodec", "aac",
                "-b:a", "128k",
                outputName
            ]);

            const data = await ffmpeg.readFile(outputName);
            const dataArray = typeof data === "string" ? new TextEncoder().encode(data) : data;
            const regularBuffer = new ArrayBuffer(dataArray.length);
            new Uint8Array(regularBuffer).set(dataArray);
            
            const blob = new Blob([regularBuffer], { type: "video/mp4" });
            const url = URL.createObjectURL(blob);
            
            setOutputFilename(file.name.replace(/\.[^/.]+$/, "") + "_compressed.mp4");
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");

            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);
        } catch (err) {
            setErrorMsg("Compression failed: Error during H.264 re-encoding.");
            setConvState("error");
        }
    };

    const triggerDownload = () => {
        if (!downloadUrl) return;
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = outputFilename;
        a.click();
    };

    const reset = () => {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setFile(null);
        setConvState("idle");
        setProgress(0);
        setErrorMsg(null);
        setDownloadUrl(null);
    };

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                <Link href="/tools" className="inline-flex items-center gap-2 text-[#9090b0] hover:text-white text-sm mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> All Tools
                </Link>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12 text-center sm:text-left">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center shadow-2xl flex-shrink-0 animate-in fade-in zoom-in">
                        <PackageMinus className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Compress Video</h1>
                        <p className="text-[#9090b0] mt-3 text-lg leading-relaxed max-w-2xl text-balance">
                            Reduce video file size while maintaining excellent quality using advanced <strong className="text-white text-teal-400">H.264</strong> compression.
                        </p>
                    </div>
                </div>

                <div className="glass rounded-[2rem] p-6 sm:p-10 mb-10 relative overflow-hidden">
                    {convState === "loading-ffmpeg" && (
                        <div className="py-20 flex flex-col items-center animate-pulse">
                            <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-white tracking-tight">Deploying Encoders...</h3>
                        </div>
                    )}

                    {(convState === "idle" || convState === "error") && (
                        <div className="animate-in fade-in duration-500">
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                                className="grid md:grid-cols-2 gap-8 items-start"
                            >
                                <div
                                    onClick={() => inputRef.current?.click()}
                                    className={`relative flex flex-col items-center justify-center gap-6 p-12 sm:p-16 rounded-[1.5rem] cursor-pointer transition-all duration-500 border-2 border-dashed group/dropzone ${dragging ? "border-teal-500 bg-teal-600/10" : "border-white/10 bg-white/[0.02] hover:border-teal-500/40"}`}
                                >
                                    <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                                    {file ? (
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                                                <Video className="w-8 h-8 text-teal-400" />
                                            </div>
                                            <p className="text-white font-bold text-lg truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-[#606080] text-sm mt-1">{formatBytes(file.size)}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-teal-400 mb-2 transition-transform group-hover/dropzone:-translate-y-1" />
                                            <div className="text-center">
                                                <p className="text-white font-black text-xl tracking-tight leading-none">Drop Video</p>
                                                <p className="text-[#9090b0] font-medium text-xs mt-2">MP4, MKV, AVI, MOV</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-teal-500" />
                                            Compression Quality
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: "balanced", label: "Balanced", desc: "Best quality vs size ratio", icon: "💎" },
                                                { id: "smaller", label: "Small File", desc: "Noticeable savings, minor loss", icon: "📦" },
                                                { id: "extreme", label: "Extreme", desc: "Maximum compression", icon: "🗜️" }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setQuality(opt.id as CompressionQuality)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${quality === opt.id
                                                            ? "bg-teal-500/15 border-teal-500/40 shadow-[0_4px_20px_-5px_rgba(20,184,166,0.3)]"
                                                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl">{opt.icon}</span>
                                                            <div>
                                                                <p className="text-white font-bold text-sm">{opt.label}</p>
                                                                <p className="text-[#606080] text-[10px] mt-0.5">{opt.desc}</p>
                                                            </div>
                                                        </div>
                                                        {quality === opt.id && <CheckCircle2 className="w-4 h-4 text-teal-500" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errorMsg && <p className="mt-6 text-red-400 text-center font-bold text-sm bg-red-500/10 py-3 rounded-xl border border-red-500/20">{errorMsg}</p>}
                            
                            {file && (
                                <button onClick={compress} disabled={!ffmpegLoaded} className={`mt-8 w-full py-5 rounded-xl font-black text-white text-lg transition-all ${ffmpegLoaded ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 shadow-xl shadow-teal-900/40" : "bg-white/5"}`}>
                                    {ffmpegLoaded ? "Start Compression" : "Loading Engine..."}
                                </button>
                            )}
                        </div>
                    )}

                    {convState === "processing" && (
                        <div className="py-12 flex flex-col items-center gap-8 animate-in fade-in duration-500">
                            <div className="relative w-40 h-40">
                                <div className="absolute inset-0 rounded-full border-8 border-white/5" />
                                <svg className="absolute inset-0 w-40 h-40 -rotate-90 drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]" viewBox="0 0 160 160">
                                    <circle
                                        cx="80" cy="80" r="72"
                                        stroke="url(#compGrad)"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 72}`}
                                        strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
                                        className="transition-all duration-700 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="compGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#14b8a6" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <Loader2 className="w-10 h-10 text-teal-500 animate-spin opacity-50 mb-1" />
                                    <div className="text-3xl font-black text-white">{progress}%</div>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-3xl font-black text-white tracking-tight">Re-Encoding H.264...</h3>
                                <p className="text-[#9090b0] mt-3 font-medium max-w-sm italic opacity-80">"Heavy mathematical lifting taking place in your browser memory."</p>
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-10 flex flex-col items-center gap-8 animate-in zoom-in fade-in">
                            <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-900/10">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-black text-white tracking-tight leading-none text-balance">Video Compressed!</h3>
                                <p className="text-[#9090b0] text-lg mt-4 font-medium max-w-xs mx-auto">Your H.264 MP4 file is ready for download.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4">
                                <button onClick={triggerDownload} className="flex-1 flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:scale-[1.02] text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-teal-900/40">
                                    <Download className="w-6 h-6" /> Download
                                </button>
                                <button onClick={reset} className="flex items-center justify-center gap-2 px-8 py-5 glass hover:bg-white/10 text-white font-bold rounded-2xl transition-all">
                                    <RefreshCw className="w-5 h-5" /> New File
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="glass rounded-[1.5rem] p-6 flex gap-4 border border-teal-500/10 hover:bg-teal-500/[0.02] transition-colors">
                        <span className="text-2xl mt-1">🧠</span>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-wider mb-2">Advanced CRF Logic</p>
                            <p className="text-[#9090b0] text-xs leading-relaxed font-medium">Constant Rate Factor (CRF) ensures the encoder spends bits exactly where they are needed to preserve visual quality.</p>
                        </div>
                    </div>
                    <div className="glass rounded-[1.5rem] p-6 flex gap-4 border border-teal-500/10 hover:bg-teal-500/[0.02] transition-colors">
                        <span className="text-2xl mt-1">🔒</span>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-wider mb-2">Hardware Sandbox</p>
                            <p className="text-[#9090b0] text-xs leading-relaxed font-medium">Processing happens in a secure WebAssembly sandbox, ensuring your private videos never leave your local machine.</p>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{` .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); } `}</style>
        </div>
    );
}
