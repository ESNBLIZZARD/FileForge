"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Download,
    RefreshCw,
    CheckCircle2,
    Clock,
    Loader2,
    Shield,
    Trash2,
    Image as ImageIcon,
    File as FileIcon,
    AlertCircle,
    ChevronDown,
    Zap,
} from "lucide-react";
import { getToolById, tools } from "@/lib/tools";
import FileUploader from "@/components/tools/FileUploader";
import ToolCard from "@/components/tools/ToolCard";
import JSZip from "jszip";

// PDF.js imports
import * as pdfjs from "pdfjs-dist";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ConversionState = "idle" | "loading" | "converting" | "done" | "error";

interface ConvertedImage {
    url: string;
    page: number;
}

export default function PdfToImagePage() {
    const tool = getToolById("pdf-to-image");
    
    const [files, setFiles] = useState<{ name: string; size: number; file: File }[]>([]);
    const [outputFormat, setOutputFormat] = useState("PNG");
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [stageLabel, setStageLabel] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
    const [showFormatDropdown, setShowFormatDropdown] = useState(false);
    
    if (!tool) return null;

    const relatedTools = tools
        .filter((t) => t.category === "pdf" && t.id !== "pdf-to-image")
        .slice(0, 4);

    const startConversion = async () => {
        if (files.length === 0) return;
        
        setConvState("loading");
        setProgress(0);
        setStageLabel("Loading PDF...");
        setConvertedImages([]);
        setErrorMsg(null);

        try {
            const file = files[0].file;
            const arrayBuffer = await file.arrayBuffer();
            
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            setConvState("converting");
            setStageLabel(`Converting ${pdf.numPages} pages...`);
            
            const images: ConvertedImage[] = [];
            
            for (let i = 1; i <= pdf.numPages; i++) {
                setProgress(Math.round(((i - 1) / pdf.numPages) * 100));
                setStageLabel(`Processing page ${i} of ${pdf.numPages}...`);
                
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // High quality
                
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                
                if (!context) throw new Error("Could not create canvas context");
                
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;
                
                const type = outputFormat === "PNG" ? "image/png" : "image/jpeg";
                const url = canvas.toDataURL(type, 0.9);
                images.push({ url, page: i });
                
                // Small delay to allow UI updates
                await new Promise(r => setTimeout(r, 50));
            }
            
            setConvertedImages(images);
            setProgress(100);
            setStageLabel("All pages converted!");
            setConvState("done");
        } catch (err: any) {
            console.error("Conversion failed:", err);
            setErrorMsg(err.message || "An error occurred during conversion.");
            setConvState("error");
        }
    };

    const handleDownloadAll = async () => {
        if (convertedImages.length === 0) return;
        
        if (convertedImages.length === 1) {
            const a = document.createElement("a");
            a.href = convertedImages[0].url;
            a.download = `page_${convertedImages[0].page}.${outputFormat.toLowerCase()}`;
            a.click();
            return;
        }
        
        // Multiple pages -> ZIP
        const zip = new JSZip();
        convertedImages.forEach((img) => {
            const base64Data = img.url.split(",")[1];
            zip.file(`page_${img.page}.${outputFormat.toLowerCase()}`, base64Data, { base64: true });
        });
        
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `converted_images.zip`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFiles([]);
        setConvState("idle");
        setProgress(0);
        setStageLabel("");
        setConvertedImages([]);
        setErrorMsg(null);
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
                        <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                            {tool.name}
                        </h1>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">{tool.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#9090b0] flex-wrap">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-green-500" />
                                100% Secure · Processed in Browser
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-violet-400" />
                                Instant Conversion
                            </span>
                            <span className="flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                Free · High Quality
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
                    {(convState === "idle" || convState === "error") && (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <label className="text-sm text-[#9090b0] font-medium mb-2 block">
                                        Output Format
                                    </label>
                                    <div className="relative inline-block">
                                        <button
                                            onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                                            className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-white text-sm font-medium hover:bg-white/[0.08] transition-all min-w-32"
                                        >
                                            <span className="w-2 h-2 rounded-full bg-purple-400" />
                                            {outputFormat}
                                            <ChevronDown
                                                className={`w-4 h-4 text-[#9090b0] ml-auto transition-transform ${showFormatDropdown ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>
                                        {showFormatDropdown && (
                                            <div className="absolute top-full left-0 mt-1 w-full glass rounded-xl py-1 shadow-xl z-10">
                                                {["PNG", "JPG"].map((fmt) => (
                                                    <button
                                                        key={fmt}
                                                        onClick={() => {
                                                            setOutputFormat(fmt);
                                                            setShowFormatDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${fmt === outputFormat
                                                                ? "text-purple-400"
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
                            </div>

                            <FileUploader
                                acceptFormats={tool.inputFormats}
                                onFilesChange={setFiles}
                            />

                            {errorMsg && (
                                <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-300/80 text-sm">{errorMsg}</p>
                                </div>
                            )}

                            <div className="mt-6">
                                <button
                                    onClick={startConversion}
                                    disabled={files.length === 0}
                                    className={`w-full py-4 rounded-xl font-semibold text-white text-base transition-all ${files.length > 0
                                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40"
                                            : "bg-white/[0.06] text-[#9090b0] cursor-not-allowed"
                                        }`}
                                >
                                    {files.length === 0
                                        ? "Upload a PDF to convert"
                                        : `Convert to ${outputFormat}`}
                                </button>
                            </div>
                        </>
                    )}

                    {(convState === "loading" || convState === "converting") && (
                        <div className="py-12 flex flex-col items-center gap-6">
                            <div className="relative w-28 h-28">
                                <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
                                <svg
                                    className="absolute inset-0 w-28 h-28 -rotate-90"
                                    viewBox="0 0 112 112"
                                >
                                    <circle
                                        cx="56"
                                        cy="56"
                                        r="50"
                                        stroke="url(#progressGrad)"
                                        strokeWidth="5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                                    />
                                    <defs>
                                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#9333ea" />
                                            <stop offset="100%" stopColor="#4f46e5" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold text-2xl">{progress}%</p>
                                <p className="text-[#9090b0] text-sm mt-1 font-medium">{stageLabel}</p>
                            </div>
                            <div className="w-full max-w-sm bg-white/[0.06] rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {convState === "done" && (
                        <div className="py-6 flex flex-col items-center gap-8">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white font-bold text-2xl">Conversion Complete!</h3>
                                    <p className="text-[#9090b0] text-sm mt-1">
                                        Converted {convertedImages.length} page{convertedImages.length !== 1 ? "s" : ""} to {outputFormat}.
                                    </p>
                                </div>
                            </div>

                            {/* Preview Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                                {convertedImages.slice(0, 8).map((img) => (
                                    <div key={img.page} className="relative group aspect-[3/4] rounded-lg overflow-hidden glass border border-white/10">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.url} alt={`Page ${img.page}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">Page {img.page}</span>
                                        </div>
                                    </div>
                                ))}
                                {convertedImages.length > 8 && (
                                    <div className="aspect-[3/4] rounded-lg flex items-center justify-center glass border border-white/10 text-[#9090b0] text-sm font-medium">
                                        +{convertedImages.length - 8} more
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                                <button
                                    onClick={handleDownloadAll}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-xl shadow-purple-900/40"
                                >
                                    <Download className="w-5 h-5" />
                                    Download {convertedImages.length > 1 ? "All as ZIP" : `Page 1 (.${outputFormat.toLowerCase()})`}
                                </button>
                                <button
                                    onClick={reset}
                                    className="flex items-center justify-center gap-2 px-6 py-4 glass text-[#9090b0] hover:text-white rounded-xl transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    New File
                                </button>
                            </div>
                            
                            <p className="text-xs text-[#9090b0] flex items-center gap-1.5">
                                <Trash2 className="w-3.5 h-3.5" />
                                Files processed entirely in your browser
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-16">
                    {[
                        {
                            emoji: "⚡",
                            title: "Browser Based",
                            desc: "Processing happens on your device. Your PDF never leaves your computer.",
                        },
                        {
                            emoji: "💎",
                            title: "High Quality",
                            desc: "We render each page at 2x resolution for crisp, professional images.",
                        },
                        {
                            emoji: "📁",
                            title: "Smart Output",
                            desc: "Get individual files or a single ZIP container for multi-page documents.",
                        },
                    ].map((item) => (
                        <div key={item.title} className="glass rounded-xl p-5 flex gap-4">
                            <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                            <div>
                                <p className="text-white font-semibold text-sm">{item.title}</p>
                                <p className="text-[#9090b0] text-xs mt-1 leading-relaxed">
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
