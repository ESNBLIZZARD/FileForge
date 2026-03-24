"use client";

import { useState, useCallback, useRef } from "react";
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
    Stamp,
    Settings2,
    Type,
    RotateCcw,
    Layers,
} from "lucide-react";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";
import { trackConversion } from "@/lib/utils/track";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

type ConversionState = "idle" | "processing" | "done" | "error";

export default function PdfWatermarkPage() {
    const [file, setFile] = useState<File | null>(null);
    const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
    const [opacity, setOpacity] = useState(0.3);
    const [rotation, setRotation] = useState(-45);
    const [fontSize, setFontSize] = useState(60);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "pdf-utilities" && t.id !== "pdf-watermark")
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

    const addWatermark = async () => {
        if (!file || !watermarkText) return;
        setConvState("processing");
        setProgress(10);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                
                page.drawText(watermarkText, {
                    x: width / 2 - (font.widthOfTextAtSize(watermarkText, fontSize) / 2) * Math.cos((rotation * Math.PI) / 180),
                    y: height / 2,
                    size: fontSize,
                    font: font,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: opacity,
                    rotate: degrees(rotation),
                });
                
                setProgress(Math.round(10 + ((i + 1) / pages.length) * 80));
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");

            // Log to history
            await trackConversion(file.name, "PDF", "pdf-watermark");
        } catch (err) {
            console.error("Watermark failed:", err);
            setErrorMsg("An unexpected error occurred while adding the watermark.");
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl flex-shrink-0">
                        <Stamp className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Watermark PDF</h1>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">
                            Protect your content with custom text watermarks.
                            Processed locally in your browser for <strong className="text-white">maximum privacy</strong>.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr,320px] gap-8">
                    <div className="space-y-6">
                        <div className="glass rounded-2xl p-6 sm:p-8">
                            {(convState === "idle" || convState === "error") && (
                                <>
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                                        onClick={() => inputRef.current?.click()}
                                        className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${dragging
                                                ? "border-indigo-500 bg-indigo-600/10 scale-[1.01]"
                                                : file
                                                    ? "border-indigo-500/50 bg-indigo-600/5"
                                                    : "border-white/[0.12] bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-600/5"
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
                                                <div className="w-14 h-14 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                                                    <File className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <p className="text-white font-semibold text-lg truncate max-w-xs">{file.name}</p>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                    className="text-xs text-[#9090b0] hover:text-white transition-colors"
                                                >
                                                    Change file
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
                                                    <Upload className="w-8 h-8 text-indigo-400" />
                                                </div>
                                                <p className="text-white font-semibold text-lg">Select PDF file</p>
                                                <p className="text-[#9090b0] text-sm">or drag and drop it here</p>
                                            </>
                                        )}
                                    </div>

                                    {file && (
                                        <button
                                            onClick={addWatermark}
                                            className="mt-8 w-full py-4 rounded-xl font-semibold text-white text-base transition-all bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-900/40"
                                        >
                                            Add Watermark Now
                                        </button>
                                    )}

                                    {errorMsg && (
                                        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            <p className="text-red-300 text-xs">{errorMsg}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {convState === "processing" && (
                                <div className="py-12 flex flex-col items-center gap-8">
                                    <div className="relative w-32 h-32">
                                        <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
                                        <svg className="absolute inset-0 w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                                            <circle
                                                cx="64" cy="64" r="58"
                                                stroke="url(#watermarkGrad)"
                                                strokeWidth="6"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 58}`}
                                                strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                                                style={{ transition: "stroke-dashoffset 0.4s ease" }}
                                            />
                                            <defs>
                                                <linearGradient id="watermarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#6366f1" />
                                                    <stop offset="100%" stopColor="#a855f7" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col text-indigo-400">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <span className="text-white text-base font-bold mt-2">{progress}%</span>
                                        </div>
                                    </div>
                                    <p className="text-white font-semibold text-xl text-center">Applying Watermark…</p>
                                </div>
                            )}

                            {convState === "done" && downloadUrl && (
                                <div className="py-12 flex flex-col items-center gap-8 text-center animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-2xl shadow-green-500/10">
                                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-2xl">Watermark Applied!</h3>
                                        <p className="text-[#9090b0] mt-2">Your document is ready for download.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                        <button
                                            onClick={() => {
                                                const a = document.createElement("a");
                                                a.href = downloadUrl;
                                                a.download = `watermarked_${file?.name || "document.pdf"}`;
                                                a.click();
                                            }}
                                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download PDF
                                        </button>
                                        <button
                                            onClick={() => { setFile(null); setConvState("idle"); setProgress(0); }}
                                            className="px-8 py-4 glass text-[#9090b0] hover:text-white rounded-xl font-medium transition-all"
                                        >
                                            New File
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass rounded-2xl p-6 border border-white/5">
                            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-indigo-400" />
                                Appearance
                            </h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-[#9090b0] uppercase tracking-wider mb-2 block">Watermark Text</label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090b0]" />
                                        <input
                                            type="text"
                                            value={watermarkText}
                                            onChange={(e) => setWatermarkText(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-[#9090b0] uppercase tracking-wider">Opacity</label>
                                        <span className="text-xs text-white font-mono">{Math.round(opacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={opacity}
                                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-[#9090b0] uppercase tracking-wider flex items-center gap-1">
                                            <RotateCcw className="w-3 h-3" />
                                            Rotation
                                        </label>
                                        <span className="text-xs text-white font-mono">{rotation}°</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-180"
                                        max="180"
                                        step="15"
                                        value={rotation}
                                        onChange={(e) => setRotation(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-[#9090b0] uppercase tracking-wider">Font Size</label>
                                        <span className="text-xs text-white font-mono">{fontSize}pt</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="20"
                                        max="120"
                                        step="5"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <Shield className="w-5 h-5 text-green-400" />
                                </div>
                                <span className="text-white text-sm font-semibold">Client-Side Protection</span>
                            </div>
                            <p className="text-[#9090b0] text-xs leading-relaxed">
                                Watermarking is performed entirely in your browser. No PDF data is ever uploaded to our servers.
                            </p>
                        </div>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-2xl font-bold text-white mb-8">Other PDF Utilities</h2>
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
