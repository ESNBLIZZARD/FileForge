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
    Music,
    Trash2,
    Mic,
} from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";

type ConversionState = "loading-ffmpeg" | "idle" | "processing" | "done" | "error";

type AudioFormat = "mp3" | "wav" | "aac";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ExtractAudioPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("loading-ffmpeg");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [outputFilename, setOutputFilename] = useState("extracted_audio.mp3");
    const [format, setFormat] = useState<AudioFormat>("mp3");
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "video" && t.id !== "extract-audio")
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
                setErrorMsg("Technical error: Failed to initialize audio engine.");
                setConvState("error");
            }
        };
        loadFfmpeg();
    }, []);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];
        const ext = selected.name.toLowerCase().split('.').pop();
        if (!['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext || '')) {
            setErrorMsg("Select a valid video file.");
            return;
        }
        if (selected.size > 500 * 1024 * 1024) {
            setErrorMsg("Max file size 500MB.");
            return;
        }
        setErrorMsg(null);
        setFile(selected);
        setConvState("idle");
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    }, [downloadUrl]);

    const extract = async () => {
        if (!file || !ffmpegRef.current || !ffmpegLoaded) return;
        setConvState("processing");
        setProgress(0);

        try {
            const ffmpeg = ffmpegRef.current;
            const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
            const outputName = `output.${format}`;

            await ffmpeg.writeFile(inputName, await fetchFile(file));
            
            // Extract audio with no video stream
            const args = ["-i", inputName, "-vn"];
            if (format === "mp3") {
                args.push("-acodec", "libmp3lame", "-q:a", "2");
            } else if (format === "wav") {
                args.push("-acodec", "pcm_s16le");
            } else if (format === "aac") {
                args.push("-acodec", "aac", "-b:a", "192k");
            }
            args.push(outputName);

            await ffmpeg.exec(args);

            const data = await ffmpeg.readFile(outputName);
            const dataArray = typeof data === "string" ? new TextEncoder().encode(data) : data;
            const regularBuffer = new ArrayBuffer(dataArray.length);
            new Uint8Array(regularBuffer).set(dataArray);
            
            const mimeType = format === "mp3" ? "audio/mpeg" : format === "wav" ? "audio/wav" : "audio/aac";
            const blob = new Blob([regularBuffer], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            setOutputFilename(file.name.replace(/\.[^/.]+$/, "") + `.${format}`);
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");

            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);
        } catch (err) {
            setErrorMsg("Extraction failed: Could not process audio stream.");
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
        <div className="min-h-screen pt-24 pb-24 px-4 overflow-x-hidden text-slate-100">
            <div className="max-w-4xl mx-auto">
                <Link href="/tools" className="inline-flex items-center gap-2 text-[#9090b0] hover:text-white text-sm mb-8 transition-colors group px-4 py-2 hover:bg-white/5 rounded-full">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
                </Link>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12 text-center sm:text-left animate-in slide-in-from-top-4 duration-700">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-500/20 flex-shrink-0">
                        <Mic className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <Zap className="w-3 h-3" /> Audio Precision
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none mb-4">Extract Audio</h1>
                        <p className="text-[#9090b0] text-xl font-medium leading-relaxed max-w-2xl">
                            High-fidelity audio extraction from any video file. Output to <strong className="text-indigo-400 font-black">MP3</strong> or <strong className="text-purple-400 font-black">WAV</strong> without quality loss.
                        </p>
                    </div>
                </div>

                <div className="glass rounded-[2.5rem] p-6 sm:p-12 mb-12 relative overflow-hidden group">
                    {convState === "loading-ffmpeg" && (
                        <div className="py-24 flex flex-col items-center animate-pulse">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-6" />
                            <h3 className="text-2xl font-black text-white tracking-tight">Calibrating Audio Engine...</h3>
                        </div>
                    )}

                    {(convState === "idle" || convState === "error") && (
                        <div className="animate-in fade-in duration-700">
                            <div className="grid md:grid-cols-5 gap-10 items-start">
                                <div className="md:col-span-3">
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                                        onClick={() => inputRef.current?.click()}
                                        className={`relative flex flex-col items-center justify-center gap-8 p-12 sm:p-20 rounded-[2rem] cursor-pointer transition-all duration-500 border-2 border-dashed ${dragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:border-indigo-500/40 hover:bg-white/[0.04] shadow-inner"}`}
                                    >
                                        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                                        {file ? (
                                            <div className="text-center flex flex-col items-center gap-6">
                                                <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-500/20 flex items-center justify-center shadow-xl">
                                                    <Video className="w-10 h-10 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-2xl truncate max-w-xs mb-1 tracking-tight">{file.name}</p>
                                                    <p className="text-indigo-400/60 font-bold text-sm">{formatBytes(file.size)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-indigo-500/10 px-6 py-2 rounded-full border border-indigo-500/20 animate-bounce">
                                                    <Music className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-indigo-400 text-sm font-black tracking-widest uppercase italic">Ready to Rip</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-6 text-center group/uploader">
                                                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center transition-all duration-500 group-hover/uploader:scale-110 group-hover/uploader:shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                                    <Upload className="w-10 h-10 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-3xl tracking-tight leading-none">Drop Video</p>
                                                    <p className="text-[#606080] font-bold text-sm mt-3 uppercase tracking-tighter italic">Or click to select</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-8 h-full flex flex-col justify-center">
                                    <div>
                                        <label className="text-white font-black text-sm uppercase tracking-widest mb-4 block opacity-80 italic">Select Format</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: "mp3", label: "MP3", desc: "Best Compatibility", color: "from-indigo-400 to-indigo-600" },
                                                { id: "wav", label: "WAV", desc: "Lossless Quality", color: "from-purple-400 to-purple-600" }
                                            ].map((f) => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => setFormat(f.id as AudioFormat)}
                                                    className={`relative p-5 rounded-2xl border transition-all duration-500 text-left overflow-hidden ${format === f.id ? "border-white/20 shadow-2xl scale-[1.05] z-10" : "border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"}`}
                                                >
                                                    {format === f.id && <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-10 animate-pulse`} />}
                                                    <p className="text-white font-black text-xl leading-none mb-1">{f.label}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">{f.desc}</p>
                                                    {format === f.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                                        <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        <p className="text-[11px] text-[#9090b0] font-bold leading-relaxed tracking-tight uppercase">Privacy Lock: External servers are bypassed. Extraction occurs solely within your browser sandbox.</p>
                                    </div>
                                </div>
                            </div>

                            {errorMsg && <p className="mt-8 text-red-500 text-center font-black text-sm uppercase tracking-widest bg-red-500/10 py-4 rounded-2xl border border-red-500/20">{errorMsg}</p>}
                            
                            {file && (
                                <button onClick={extract} disabled={!ffmpegLoaded} className={`mt-10 w-full py-6 rounded-3xl font-black text-white text-2xl tracking-tighter italic transition-all duration-500 ${ffmpegLoaded ? "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 hover:scale-[1.01] shadow-[0_10px_40px_-10px_rgba(99,102,241,0.5)]" : "bg-white/5 opacity-30 cursor-not-allowed"}`}>
                                    EXTRACT {format.toUpperCase()} NOW
                                </button>
                            )}
                        </div>
                    )}

                    {convState === "processing" && (
                        <div className="py-20 flex flex-col items-center gap-10 animate-in fade-in duration-700">
                            <div className="relative w-48 h-48">
                                <div className="absolute inset-0 rounded-full border-12 border-white/5 shadow-inner" />
                                <svg className="absolute inset-0 w-48 h-48 -rotate-90" viewBox="0 0 160 160">
                                    <circle
                                        cx="80" cy="80" r="72"
                                        stroke="url(#jackGrad)"
                                        strokeWidth="16"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 72}`}
                                        strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
                                        className="transition-all duration-700 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="jackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-5xl font-black text-white italic tracking-tighter drop-shadow-2xl">{progress}%</div>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Ripping Streams...</h3>
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-10 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-8 bg-purple-500 rounded-full animate-bounce" />
                                    <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] ml-2 italic">Audio Frequency Mapping</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-12 flex flex-col items-center gap-10 animate-in zoom-in-95 fade-in duration-1000">
                            <div className="relative">
                                <div className="absolute -inset-8 bg-green-500/20 blur-[50px] rounded-full animate-pulse" />
                                <div className="w-28 h-28 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center relative z-10 shadow-2xl">
                                    <CheckCircle2 className="w-14 h-14 text-green-400" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-5xl font-black text-white tracking-tighter leading-none mb-4 italic">Audio Extracted!</h3>
                                <p className="text-[#9090b0] text-xl font-medium">Your track resides safely in memory.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg mt-4">
                                <button onClick={triggerDownload} className="flex-1 flex items-center justify-center gap-4 py-6 bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black text-2xl rounded-3xl transition-all shadow-2xl shadow-indigo-900/40 italic">
                                    <Download className="w-7 h-7" /> SAVE {format.toUpperCase()}
                                </button>
                                <button onClick={reset} className="flex items-center justify-center gap-3 px-10 py-6 glass hover:bg-white/10 text-white font-black text-lg rounded-3xl transition-all uppercase tracking-widest">
                                    <RefreshCw className="w-6 h-6" /> RESET
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {relatedTools.length > 0 && (
                    <div className="animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4 px-2 tracking-tighter italic">
                            <span className="w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent rounded-full" />
                            OTHER BROADCAST TOOLS
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedTools.map((t, i) => <ToolCard key={t.id} tool={t} index={i} />)}
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{` 
                .glass { background: rgba(15, 15, 25, 0.4); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.05); }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
            `}</style>
        </div>
    );
}
