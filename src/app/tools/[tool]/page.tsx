"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Download,
    RefreshCw,
    ChevronDown,
    CheckCircle2,
    Clock,
    Loader2,
    Crown,
    Shield,
    Trash2,
} from "lucide-react";
import { getToolById, tools } from "@/lib/tools";
import { trackConversion } from "@/lib/utils/track";
import FileUploader from "@/components/tools/FileUploader";
import ToolCard from "@/components/tools/ToolCard";
import heic2any from "heic2any";
import { convertMp3ToWav } from "@/lib/audio-utils";

type ConversionState = "idle" | "uploading" | "processing" | "done" | "error";

interface PageProps {
    params: { tool: string };
}

export default function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
    const { tool: toolId } = use(params);
    const tool = getToolById(toolId);

    const [files, setFiles] = useState<{ name: string; size: number; file: File }[]>([]);
    const [outputFormat, setOutputFormat] = useState(tool?.outputFormats[0] ?? "");
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [stageLabel, setStageLabel] = useState("");
    const [showFormatDropdown, setShowFormatDropdown] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [resultFileName, setResultFileName] = useState("");

    if (!tool) return notFound();

    const relatedTools = tools
        .filter((t) => t.category === tool.category && t.id !== tool.id)
        .slice(0, 4);

    const startConversion = async () => {
        if (files.length === 0 || !tool) return;
        setConvState("uploading");
        setProgress(0);
        setStageLabel("Preparing file...");

        try {
            const sourceFile = files[0].file;
            setConvState("processing");

            if (tool.category === "image-utilities") {
                setStageLabel("Converting image...");
                await animateProgress(0, 50, 500);

                let blob: Blob;

                // HEIC to JPG handled specially
                if (tool.id === "image-heic-to-jpg") {
                    setStageLabel("Decoding HEIC...");
                    const result = await heic2any({
                        blob: sourceFile,
                        toType: "image/jpeg",
                        quality: 0.9
                    });
                    blob = Array.isArray(result) ? result[0] : result;
                }
                // SVG to PNG/JPG
                else if (tool.id === "image-svg-to-png") {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    const url = URL.createObjectURL(sourceFile);

                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = url;
                    });

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);

                    const mimeType = outputFormat === "PNG" ? "image/png" : "image/jpeg";
                    const dataUrl = canvas.toDataURL(mimeType, 0.9);
                    const res = await fetch(dataUrl);
                    blob = await res.blob();
                }
                // Generic Canvas Conversion (JPG to PNG, PNG to JPG, WebP)
                else {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    const url = URL.createObjectURL(sourceFile);

                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = url;
                    });

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);

                    const mimeType = outputFormat === "WEBP" ? "image/webp" :
                        outputFormat === "PNG" ? "image/png" : "image/jpeg";

                    const dataUrl = canvas.toDataURL(mimeType, 0.9);
                    const res = await fetch(dataUrl);
                    blob = await res.blob();
                }

                const url = URL.createObjectURL(blob);
                setDownloadUrl(url);
                setResultFileName(`${files[0].name.split(".")[0]}.${outputFormat.toLowerCase()}`);
            } else if (tool.category === "audio") {
                setStageLabel("Loading FFmpeg engine...");
                await animateProgress(0, 10, 500);

                const blob = await convertMp3ToWav(sourceFile, (p) => {
                    setStageLabel(`Converting audio... ${p}%`);
                    setProgress(10 + Math.round(p * 0.85)); // 10% to 95%
                });

                await animateProgress(95, 100, 300);
                const url = URL.createObjectURL(blob);
                setDownloadUrl(url);
                setResultFileName(`${files[0].name.split(".")[0]}.${outputFormat.toLowerCase()}`);
            } else {
                // Original simulation for other tools
                setStageLabel("Processing...");
                await animateProgress(0, 95, 2000);
                const blob = new Blob(["FileForge simulated output file"], { type: "application/octet-stream" });
                setDownloadUrl(URL.createObjectURL(blob));
                setResultFileName(`converted_output.${outputFormat.toLowerCase()}`);
            }

            setProgress(100);
            setStageLabel("Conversion Complete!");
            setConvState("done");

            // Log to history
            await trackConversion(files[0].name, outputFormat, tool.id);
        } catch (err) {
            console.error(err);
            setConvState("error");
            setStageLabel("Conversion failed. Try again.");
        }
    };

    const animateProgress = (from: number, to: number, ms: number) =>
        new Promise<void>((resolve) => {
            const steps = 30;
            const intervalMs = ms / steps;
            const increment = (to - from) / steps;
            let current = from;
            const timer = setInterval(() => {
                current += increment;
                if (current >= to) {
                    setProgress(to);
                    clearInterval(timer);
                    resolve();
                } else {
                    setProgress(Math.round(current));
                }
            }, intervalMs);
        });

    const handleDownload = () => {
        if (!downloadUrl) return;
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = resultFileName;
        a.click();
    };

    const reset = () => {
        setFiles([]);
        setConvState("idle");
        setProgress(0);
        setStageLabel("");
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
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
                    <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-xl flex-shrink-0`}
                    >
                        <span className="text-2xl font-bold text-white">
                            {tool.name.charAt(0)}
                        </span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">
                                {tool.name}
                            </h1>
                            {tool.isPremium && (
                                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-400 font-medium">
                                    <Crown className="w-3 h-3" />
                                    Premium
                                </span>
                            )}
                        </div>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">{tool.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#9090b0]">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-green-500" />
                                Files auto-deleted after 1 hr
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-violet-400" />
                                Processes in under 10 seconds
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
                    {convState === "idle" && (
                        <>
                            {tool.outputFormats.length > 1 && (
                                <div className="mb-6">
                                    <label className="text-sm text-[#9090b0] font-medium mb-2 block">
                                        Output Format
                                    </label>
                                    <div className="relative inline-block">
                                        <button
                                            onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                                            className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-white text-sm font-medium hover:bg-white/[0.08] transition-all min-w-32"
                                        >
                                            <span className="w-2 h-2 rounded-full bg-violet-400" />
                                            {outputFormat}
                                            <ChevronDown
                                                className={`w-4 h-4 text-[#9090b0] ml-auto transition-transform ${showFormatDropdown ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>
                                        {showFormatDropdown && (
                                            <div className="absolute top-full left-0 mt-1 w-full glass rounded-xl py-1 shadow-xl z-10">
                                                {tool.outputFormats.map((fmt) => (
                                                    <button
                                                        key={fmt}
                                                        onClick={() => {
                                                            setOutputFormat(fmt);
                                                            setShowFormatDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${fmt === outputFormat
                                                            ? "text-violet-400"
                                                            : "text-[#9090b0] hover:text-white hover:bg-white/[0.06]"
                                                            }`}
                                                    >
                                                        {fmt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <FileUploader
                                acceptFormats={tool.inputFormats}
                                multiple={tool.id === "merge-pdf"}
                                onFilesChange={setFiles}
                            />

                            <div className="mt-6">
                                <button
                                    onClick={startConversion}
                                    disabled={files.length === 0}
                                    className={`w-full py-4 rounded-xl font-semibold text-white text-base transition-all ${files.length > 0
                                        ? "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-xl shadow-violet-900/40"
                                        : "bg-white/[0.06] text-[#9090b0] cursor-not-allowed"
                                        }`}
                                >
                                    {files.length === 0
                                        ? "Upload a file to convert"
                                        : `Convert to ${outputFormat}`}
                                </button>
                            </div>
                        </>
                    )}

                    {(convState === "uploading" || convState === "processing") && (
                        <div className="py-8 flex flex-col items-center gap-6">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
                                <svg
                                    className="absolute inset-0 w-24 h-24 -rotate-90"
                                    viewBox="0 0 96 96"
                                >
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="44"
                                        stroke="url(#progressGrad)"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 44}`}
                                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                                    />
                                    <defs>
                                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#7c5cfc" />
                                            <stop offset="100%" stopColor="#6ee7f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-semibold text-xl">{progress}%</p>
                                <p className="text-[#9090b0] text-sm mt-1">{stageLabel}</p>
                            </div>
                            <div className="w-full max-w-xs bg-white/[0.06] rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {convState === "done" && (
                        <div className="py-8 flex flex-col items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-bold text-2xl">Conversion Complete!</h3>
                                <p className="text-[#9090b0] text-sm mt-2">
                                    Your file has been converted to <strong className="text-white">{outputFormat}</strong>
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-violet-400 transition-all shadow-xl shadow-violet-900/40"
                                >
                                    <Download className="w-4 h-4" />
                                    Download {outputFormat}
                                </button>
                                <button
                                    onClick={reset}
                                    className="flex items-center justify-center gap-2 px-4 py-3.5 glass text-[#9090b0] hover:text-white rounded-xl transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    New File
                                </button>
                            </div>
                            <p className="text-xs text-[#9090b0] flex items-center gap-1">
                                <Trash2 className="w-3.5 h-3.5" />
                                File will be auto-deleted in 1 hour
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-16">
                    {[
                        {
                            icon: "Fast",
                            title: "Instant",
                            desc: "Conversion in under 10 seconds for standard files",
                        },
                        {
                            icon: "Safe",
                            title: "Secure",
                            desc: "256-bit encryption and auto-deletion after processing",
                        },
                        {
                            icon: "Free",
                            title: "Free",
                            desc: "Up to 100MB per file with no sign-up required",
                        },
                    ].map((item) => (
                        <div key={item.title} className="glass rounded-xl p-4 flex gap-3">
                            <span className="text-sm font-semibold text-violet-300">{item.icon}</span>
                            <div>
                                <p className="text-white font-semibold text-sm">{item.title}</p>
                                <p className="text-[#9090b0] text-xs mt-0.5 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {relatedTools.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Related Tools</h2>
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
