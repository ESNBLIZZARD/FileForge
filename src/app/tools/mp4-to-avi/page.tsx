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
import { trackConversion } from "@/lib/utils/track";
import { tools } from "@/lib/tools";

type ConversionState = "loading-ffmpeg" | "idle" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Mp4ToAviPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("loading-ffmpeg");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [outputFilename, setOutputFilename] = useState("converted.avi");
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "video" && t.id !== "mp4-to-avi")
        .slice(0, 4);

    useEffect(() => {
        const loadFfmpeg = async () => {
            try {
                const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
                const ffmpeg = new FFmpeg();
                ffmpegRef.current = ffmpeg;

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
                console.error("FFmpeg load error:", err);
                setErrorMsg("Technical error: Failed to initialize video engine.");
                setConvState("error");
            }
        };
        loadFfmpeg();
    }, []);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];
        if (selected.name.toLowerCase().split('.').pop() !== 'mp4') {
            setErrorMsg("Select an MP4 file (.mp4).");
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

    const convert = async () => {
        if (!file || !ffmpegRef.current || !ffmpegLoaded) return;
        setConvState("processing");
        setProgress(0);

        try {
            const ffmpeg = ffmpegRef.current;
            const inputName = "input.mp4";
            const outputName = "output.avi";

            await ffmpeg.writeFile(inputName, await fetchFile(file));
            
            // Note: AVI is a very old container. Some MP4 H.264 streams might not be 
            // perfectly compatible without transcoding, but for a simple tool, 
            // container copying is the most efficient and usually works for AVI-compliant players.
            await ffmpeg.exec(["-i", inputName, "-c", "copy", outputName]);

            const data = await ffmpeg.readFile(outputName);
            const dataArray = typeof data === "string" ? new TextEncoder().encode(data) : data;
            const regularBuffer = new ArrayBuffer(dataArray.length);
            new Uint8Array(regularBuffer).set(dataArray);
            
            const blob = new Blob([regularBuffer], { type: "video/x-msvideo" });
            const url = URL.createObjectURL(blob);
            
            setOutputFilename(file.name.replace(/\.mp4$/i, "") + ".avi");
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");

            // Log to history
            await trackConversion(file.name, "Video", "mp4-to-avi");

            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);
        } catch (err) {
            setErrorMsg("Process failed: Error during container rewrite.");
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
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-2xl flex-shrink-0 animate-in fade-in zoom-in">
                        <Film className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">MP4 to AVI</h1>
                        <p className="text-[#9090b0] mt-3 text-lg leading-relaxed max-w-2xl text-balance">
                            Convert MP4 videos to <strong className="text-white">AVI</strong> for playback on legacy devices and media players.
                        </p>
                    </div>
                </div>

                <div className="glass rounded-[2rem] p-6 sm:p-10 mb-10 relative overflow-hidden">
                    {convState === "loading-ffmpeg" && (
                        <div className="py-20 flex flex-col items-center animate-pulse">
                            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-white">Initializing Engine...</h3>
                        </div>
                    )}

                    {(convState === "idle" || convState === "error") && (
                        <div className="animate-in fade-in duration-500">
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                                onClick={() => inputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center gap-6 p-12 sm:p-20 rounded-[1.5rem] cursor-pointer transition-all duration-500 border-2 border-dashed group/dropzone ${dragging ? "border-amber-500 bg-amber-600/10" : "border-white/10 bg-white/[0.02] hover:border-amber-500/40"}`}
                            >
                                <input ref={inputRef} type="file" accept="video/mp4" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                                {file ? (
                                    <div className="text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                                            <Film className="w-8 h-8 text-amber-400" />
                                        </div>
                                        <p className="text-white font-bold text-xl truncate max-w-xs">{file.name}</p>
                                        <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-green-400 text-sm font-bold tracking-wide">Ready to Convert</span>
                                            <button onClick={(e) => { e.stopPropagation(); reset(); }} className="ml-4 p-1 rounded-full text-[#9090b0] hover:text-white hover:bg-white/10">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center transition-transform group-hover/dropzone:scale-110">
                                            <Upload className="w-8 h-8 text-amber-400" />
                                        </div>
                                        <p className="text-white font-black text-2xl tracking-tight">Drag & drop MP4</p>
                                        <p className="text-[#9090b0] font-medium text-sm">Or click to browse files</p>
                                    </div>
                                )}
                            </div>
                            {errorMsg && <p className="mt-4 text-red-400 text-center font-bold text-sm bg-red-500/10 py-3 rounded-xl border border-red-500/20">{errorMsg}</p>}
                            <button onClick={convert} disabled={!file || !ffmpegLoaded} className={`mt-8 w-full py-5 rounded-xl font-black text-white text-lg transition-all ${file && ffmpegLoaded ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 shadow-xl shadow-amber-900/40" : "bg-white/5 text-[#404060] cursor-not-allowed"}`}>
                                {file ? "Convert to AVI" : "Select Video File"}
                            </button>
                        </div>
                    )}

                    {convState === "processing" && (
                        <div className="py-12 flex flex-col items-center gap-8 animate-in fade-in duration-500">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin absolute z-10" />
                                <div className="text-2xl font-black text-white z-20">{progress}%</div>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight">Multiplexing Streams...</h3>
                            <div className="w-full max-w-sm bg-white/5 rounded-full h-3 p-1">
                                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-10 flex flex-col items-center gap-8 animate-in zoom-in fade-in">
                            <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-900/10">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-black text-white tracking-tight leading-none">Conversion Success!</h3>
                                <p className="text-[#9090b0] text-lg mt-4 font-medium max-w-sm mx-auto">Your AVI file is ready for download.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4">
                                <button onClick={triggerDownload} className="flex-1 flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:scale-[1.02] text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-amber-900/30">
                                    <Download className="w-6 h-6" /> Download AVI
                                </button>
                                <button onClick={reset} className="flex items-center justify-center gap-2 px-8 py-5 glass hover:bg-white/10 text-white font-bold rounded-2xl transition-all">
                                    <RefreshCw className="w-5 h-5" /> Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-black text-white mb-8">Related Video Tools</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedTools.map((t, i) => <ToolCard key={t.id} tool={t} index={i} />)}
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{` .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); } `}</style>
        </div>
    );
}
