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
    Film,
    Trash2,
} from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";

type ConversionState = "loading-ffmpeg" | "idle" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Mp4ToMkvPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("loading-ffmpeg");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [outputFilename, setOutputFilename] = useState("converted.mkv");
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const tool = tools.find(t => t.id === "mp4-to-mkv");
    const relatedTools = tools
        .filter((t) => t.category === "video" && t.id !== "mp4-to-mkv")
        .slice(0, 4);

    // Initialize FFmpeg
    useEffect(() => {
        const loadFfmpeg = async () => {
            try {
                const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
                const ffmpeg = new FFmpeg();
                ffmpegRef.current = ffmpeg;

                ffmpeg.on("log", ({ message }) => {
                    console.log("[FFmpeg Log]", message);
                });

                ffmpeg.on("progress", ({ progress }) => {
                    setProgress(Math.round(progress * 100));
                });

                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
                });

                setFfmpegLoaded(true);
                setConvState("idle");
            } catch (err) {
                console.error("Failed to load FFmpeg:", err);
                setErrorMsg("Failed to load video processing engine. Please ensure you are using a modern browser and have a stable internet connection.");
                setConvState("error");
            }
        };

        loadFfmpeg();
    }, []);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];

        const ext = selected.name.toLowerCase().split('.').pop();
        if (ext !== 'mp4') {
            setErrorMsg("Only MP4 videos (.mp4) are supported.");
            return;
        }
        
        // Browsers have memory limits for WebAssembly (usually around 2GB)
        // We'll cap at 500MB for stability
        if (selected.size > 500 * 1024 * 1024) {
            setErrorMsg("File exceeds the 500MB limit for browser-based conversion.");
            return;
        }

        setErrorMsg(null);
        setFile(selected);
        setConvState("idle");
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    }, [downloadUrl]);

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const convert = async () => {
        if (!file || !ffmpegRef.current || !ffmpegLoaded) return;
        
        setConvState("processing");
        setProgress(0);
        setErrorMsg(null);

        try {
            const ffmpeg = ffmpegRef.current;
            const inputName = "input.mp4";
            const outputName = "output.mkv";

            // Write file to FFmpeg's virtual FS
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            // Run conversion
            // -c copy is fast as it just changes the container without re-encoding
            await ffmpeg.exec(["-i", inputName, "-c", "copy", outputName]);

            // Read the result
            const data = await ffmpeg.readFile(outputName);
            
            // SharedArrayBuffer is not allowed in Blob constructor for security reasons.
            // We must copy it to a regular ArrayBuffer.
            const dataArray = typeof data === "string" ? new TextEncoder().encode(data) : data;
            const regularBuffer = new ArrayBuffer(dataArray.length);
            new Uint8Array(regularBuffer).set(dataArray);
            
            const blob = new Blob([regularBuffer], { type: "video/x-matroska" });
            const url = URL.createObjectURL(blob);
            
            const name = file.name.replace(/\.mp4$/i, "") + ".mkv";
            setOutputFilename(name);
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");

            // Clean up files in virtual FS
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

        } catch (err: unknown) {
            console.error("Conversion error:", err);
            const message = err instanceof Error ? err.message : "An unexpected error occurred during conversion.";
            setErrorMsg(message);
            setConvState("error");
            setProgress(0);
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
        if (inputRef.current) inputRef.current.value = "";
    };

    const isProcessing = convState === "processing";

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 text-[#9090b0] hover:text-white text-sm mb-8 transition-colors group underline-offset-4 hover:underline"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    All Tools
                </Link>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12 text-center sm:text-left">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-2xl flex-shrink-0 animate-in fade-in zoom-in duration-500">
                        <Video className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">MP4 to MKV</h1>
                        <p className="text-[#9090b0] mt-3 text-lg leading-relaxed max-w-2xl">
                            Convert your <strong className="text-white">MP4</strong> videos to high-quality{" "}
                            <strong className="text-white text-rose-400">MKV</strong> files instantly. 
                            Privacy-focused, serverless processing.
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-4 mt-5 text-xs font-medium text-[#9090b0] flex-wrap">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <Shield className="w-3.5 h-3.5 text-green-500" />
                                100% Client-Side
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <Clock className="w-3.5 h-3.5 text-rose-400" />
                                Instant Multiplexing
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                Lossless Quality
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-[2rem] p-6 sm:p-10 mb-10 relative overflow-hidden group/container">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />

                    {convState === "loading-ffmpeg" && (
                        <div className="py-20 flex flex-col items-center justify-center text-center animate-pulse">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Waking up Engine...</h3>
                            <p className="text-[#9090b0] max-w-xs text-sm">Preparing FFmpeg.wasm for high-speed video processing.</p>
                        </div>
                    )}

                    {(convState === "idle" || convState === "error") && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onClick={() => inputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center gap-6 p-12 sm:p-20 rounded-[1.5rem] cursor-pointer transition-all duration-500 border-2 border-dashed group/dropzone ${dragging
                                        ? "border-rose-500 bg-rose-600/10 scale-[1.02]"
                                        : file
                                            ? "border-rose-500/40 bg-rose-600/5 hover:border-rose-500/60"
                                            : "border-white/10 bg-white/[0.02] hover:border-rose-500/40 hover:bg-rose-600/5"
                                    }`}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="video/mp4"
                                    className="hidden"
                                    onChange={(e) => handleFiles(e.target.files)}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center gap-5 w-full">
                                        <div className="w-20 h-20 rounded-2xl bg-rose-600/20 flex items-center justify-center shadow-inner group-hover/dropzone:scale-110 transition-transform duration-500">
                                            <Film className="w-10 h-10 text-rose-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-bold text-xl truncate max-w-xs sm:max-w-md mx-auto">{file.name}</p>
                                            <p className="text-[#9090b0] text-sm mt-1">{formatBytes(file.size)}</p>
                                        </div>
                                        <div className="flex items-center gap-2.5 mt-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-green-400 text-sm font-bold tracking-wide">Valid Format</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); reset(); }}
                                                className="ml-4 p-1 rounded-full text-[#9090b0] hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6 text-center">
                                        <div className={`w-20 h-20 rounded-2xl bg-rose-600/10 flex items-center justify-center transition-all duration-500 group-hover/dropzone:scale-110 group-hover/dropzone:bg-rose-600/20 ${dragging ? "scale-110 bg-rose-600/30" : ""}`}>
                                            <Upload className={`w-10 h-10 text-rose-400 transition-transform duration-500 ${dragging ? "-translate-y-2" : "group-hover/dropzone:-translate-y-1"}`} />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-2xl tracking-tight">
                                                {dragging ? "Drop to load..." : "Drag & drop MP4"}
                                            </p>
                                            <p className="text-[#9090b0] mt-2 font-medium">
                                                or <span className="text-rose-400 group-hover/dropzone:underline">browse files</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-bold text-rose-400/80 bg-rose-400/10 border border-rose-400/20 rounded px-2.5 py-1 tracking-widest uppercase">
                                                MP4 ONLY
                                            </span>
                                            <span className="text-[10px] font-bold text-[#9090b0] bg-white/5 border border-white/10 rounded px-2.5 py-1 tracking-widest uppercase">
                                                MAX 500MB
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {errorMsg && (
                                <div className="mt-6 flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 animate-in fade-in zoom-in duration-300">
                                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-red-400 font-bold text-sm">Action Required</p>
                                        <p className="text-red-300/70 text-sm mt-0.5">{errorMsg}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={convert}
                                disabled={!file || !ffmpegLoaded}
                                className={`mt-8 w-full py-5 rounded-xl font-black text-white text-lg transition-all duration-300 shadow-2xl overflow-hidden relative group/btn ${file && ffmpegLoaded
                                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 hover:scale-[1.01] shadow-rose-900/40"
                                        : "bg-white/5 text-[#404060] cursor-not-allowed border border-white/5"
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                                {file ? "Convert to MKV" : "Select Video File"}
                            </button>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="py-12 flex flex-col items-center gap-10 animate-in fade-in duration-500">
                            <div className="relative w-40 h-40 group">
                                <div className="absolute inset-0 rounded-full border-8 border-white/5 shadow-inner" />
                                <svg className="absolute inset-0 w-40 h-40 -rotate-90 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" viewBox="0 0 160 160">
                                    <circle
                                        cx="80" cy="80" r="72"
                                        stroke="url(#videoGrad)"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 72}`}
                                        strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
                                        className="transition-all duration-700 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="videoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#ef4444" />
                                            <stop offset="100%" stopColor="#e11d48" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <Loader2 className="w-10 h-10 text-rose-500 animate-spin opacity-80" />
                                    <span className="text-3xl font-black text-white mt-1 tracking-tighter">{progress}%</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-3xl font-black text-white tracking-tight">Writing MKV Container…</h3>
                                <p className="text-[#9090b0] mt-3 font-medium text-lg italic opacity-80">
                                    "Changing formats while keeping every single pixel and audio frame untouched."
                                </p>
                            </div>

                            <div className="w-full max-w-sm flex flex-col gap-2">
                                <div className="flex justify-between text-xs font-bold text-[#606080] uppercase tracking-widest mb-1 px-1">
                                    <span>Processing</span>
                                    <span>{progress}% Complete</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-3 p-1 overflow-hidden border border-white/5">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-700"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-10 flex flex-col items-center gap-10 animate-in zoom-in-95 fade-in duration-500">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                                    </div>
                                </div>
                                {/* Particle effects could be added here */}
                            </div>

                            <div className="text-center">
                                <h3 className="text-4xl font-black text-white tracking-tight">Conversion Success!</h3>
                                <p className="text-[#9090b0] text-lg mt-3 font-medium max-w-sm mx-auto">
                                    Your high-quality MKV file is processed and ready for download.
                                </p>
                            </div>

                            <div className="flex items-center gap-5 glass-card rounded-2xl px-6 py-5 w-full max-w-md border border-white/10 shadow-lg">
                                <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Film className="w-6 h-6 text-rose-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold truncate">{outputFilename}</p>
                                    <p className="text-[#9090b0] text-xs font-bold uppercase tracking-widest">Matroska Video Format</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                <button
                                    onClick={triggerDownload}
                                    className="flex-1 flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-400 text-white font-black text-lg rounded-2xl transition-all shadow-2xl shadow-rose-900/40 hover:scale-[1.02]"
                                >
                                    <Download className="w-6 h-6" />
                                    Download MKV
                                </button>
                                <button
                                    onClick={reset}
                                    className="flex items-center justify-center gap-2 px-8 py-5 border border-white/10 glass hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Convert Another
                                </button>
                            </div>

                            <p className="text-xs text-[#606080] font-bold tracking-tight bg-white/5 py-2 px-4 rounded-full border border-white/5">
                                ✨ FILE REMOVED FROM MEMORY AFTER PROCESSING
                            </p>
                        </div>
                    )}
                </div>

                {/* Benefits / Features Grid */}
                <div className="grid sm:grid-cols-3 gap-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    {[
                        {
                            emoji: "💎",
                            title: "Smart Multiplexing",
                            desc: "We use '-c copy' to wrap your existing video & audio streams into the MKV container, ensuring ZERO quality loss.",
                            color: "text-blue-400"
                        },
                        {
                            emoji: "🔐",
                            title: "Private Processing",
                            desc: "Processed entirely in your browser memory. Your video data never touches our servers. Guaranteed privacy.",
                            color: "text-green-400"
                        },
                        {
                            emoji: "⚡",
                            title: "High Precision",
                            desc: "Powered by FFmpeg.wasm, the industry-standard for video tools, right in your favorite browser.",
                            color: "text-yellow-400"
                        },
                    ].map((item) => (
                        <div key={item.title} className="glass rounded-3xl p-6 border border-white/5 group hover:bg-white/5 transition-colors duration-500">
                            <span className="text-3xl mb-4 block group-hover:scale-125 transition-transform duration-500">{item.emoji}</span>
                            <div>
                                <p className="text-white font-black text-sm uppercase tracking-wider mb-2">{item.title}</p>
                                <p className="text-[#9090b0] text-xs leading-relaxed font-medium opacity-80">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {relatedTools.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight">More Video Tools</h2>
                            <div className="w-12 h-1 bg-red-600 rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedTools.map((t, i) => (
                                <ToolCard key={t.id} tool={t} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
}
