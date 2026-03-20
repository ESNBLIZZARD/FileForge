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
    Scissors,
    Trash2,
} from "lucide-react";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";
import { PDFDocument } from "pdf-lib";

type ConversionState = "idle" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfSplitPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [range, setRange] = useState<string>("");
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "pdf" && t.id !== "pdf-split")
        .slice(0, 4);

    const handleFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];

        if (selected.type !== "application/pdf") {
            setErrorMsg("Please select a valid PDF file.");
            return;
        }

        try {
            const arrayBuffer = await selected.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            setPageCount(pdf.getPageCount());
            setFile(selected);
            setRange(`1-${pdf.getPageCount()}`);
            setErrorMsg(null);
            setConvState("idle");
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        } catch (err) {
            console.error("Failed to load PDF:", err);
            setErrorMsg("Failed to read PDF file.");
        }
    }, [downloadUrl]);

    const splitPdf = async () => {
        if (!file) return;
        
        // Basic range parser: e.g. "1-3, 5, 7-9"
        const pagesToExtract: number[] = [];
        try {
            const parts = range.split(",").map(p => p.trim());
            for (const part of parts) {
                if (part.includes("-")) {
                    const [start, end] = part.split("-").map(Number);
                    if (isNaN(start) || isNaN(end) || start < 1 || end > pageCount || start > end) {
                        throw new Error(`Invalid range: ${part}`);
                    }
                    for (let i = start; i <= end; i++) pagesToExtract.push(i - 1);
                } else {
                    const page = Number(part);
                    if (isNaN(page) || page < 1 || page > pageCount) {
                        throw new Error(`Invalid page: ${part}`);
                    }
                    pagesToExtract.push(page - 1);
                }
            }
        } catch (err: any) {
            setErrorMsg(err.message);
            return;
        }

        if (pagesToExtract.length === 0) {
            setErrorMsg("No pages selected for extraction.");
            return;
        }

        setConvState("processing");
        setProgress(20);
        setErrorMsg(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            setProgress(40);

            const splitPdf = await PDFDocument.create();
            const copiedPages = await splitPdf.copyPages(pdf, pagesToExtract);
            copiedPages.forEach((page) => splitPdf.addPage(page));
            
            setProgress(70);

            const splitPdfBytes = await splitPdf.save();
            const blob = new Blob([new Uint8Array(splitPdfBytes)], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");
        } catch (err: unknown) {
            console.error("Split failed:", err);
            setErrorMsg("An unexpected error occurred during splitting.");
            setConvState("error");
            setProgress(0);
        }
    };

    const triggerDownload = () => {
        if (!downloadUrl) return;
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `split_${file?.name || "document.pdf"}`;
        a.click();
    };

    const reset = () => {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setFile(null);
        setPageCount(0);
        setRange("");
        setConvState("idle");
        setProgress(0);
        setErrorMsg(null);
        setDownloadUrl(null);
        if (inputRef.current) inputRef.current.value = "";
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-xl flex-shrink-0">
                        <Scissors className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Split PDF</h1>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">
                            Extract specific pages or page ranges from your PDF document. 
                            Private, secure, and <strong className="text-white">runs entirely in-browser</strong>.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#9090b0] flex-wrap">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-green-500" />
                                Browser-based privacy
                            </span>
                            <span className="flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                Instant extraction
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-rose-400" />
                                Multi-range support
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
                    {(convState === "idle" || convState === "error") && (
                        <>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                                onClick={() => inputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${dragging
                                        ? "border-rose-500 bg-rose-600/10 scale-[1.01]"
                                        : file
                                            ? "border-violet-500/60 bg-violet-600/5"
                                            : "border-white/[0.12] bg-white/[0.02] hover:border-rose-500/50 hover:bg-rose-600/5"
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
                                    <div className="flex flex-col items-center gap-3 w-full animate-in zoom-in-95 duration-300">
                                        <div className="w-14 h-14 rounded-xl bg-rose-600/20 flex items-center justify-center">
                                            <File className="w-6 h-6 text-rose-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold text-lg truncate max-w-xs">{file.name}</p>
                                            <p className="text-rose-400 text-xs mt-1 font-medium bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">{pageCount} Pages detected</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-rose-600/20 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-rose-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold text-lg">Select PDF file to split</p>
                                            <p className="text-[#9090b0] text-sm mt-1">or drag and drop it here</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {file && (
                                <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] animate-in slide-in-from-bottom-2 duration-400">
                                    <label className="text-white text-sm font-semibold mb-3 block">Extract Pages</label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <input
                                            type="text"
                                            value={range}
                                            onChange={(e) => setRange(e.target.value)}
                                            placeholder="e.g. 1-3, 5, 8-10"
                                            className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-[#9090b0]/50 shadow-inner"
                                        />
                                        <button
                                            onClick={splitPdf}
                                            className="px-8 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-rose-900/40"
                                        >
                                            Split PDF
                                        </button>
                                    </div>
                                    <p className="mt-3 text-[#9090b0] text-[11px] leading-relaxed">
                                        Use commas to separate pages and hyphens for ranges. Example: <span className="text-rose-400/80 font-mono">1, 3-5, 8</span> will extract pages 1, 3, 4, 5, and 8.
                                    </p>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-300/80 text-xs leading-relaxed">{errorMsg}</p>
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
                                        stroke="url(#splitGrad)"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 58}`}
                                        strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                                        style={{ transition: "stroke-dashoffset 0.4s ease" }}
                                    />
                                    <defs>
                                        <linearGradient id="splitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#f43f5e" />
                                            <stop offset="100%" stopColor="#db2777" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col text-rose-400">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-white text-base font-bold mt-2">{progress}%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-semibold text-xl">Extracting Pages…</p>
                                <p className="text-[#9090b0] text-sm mt-1">Creating a new PDF with your selected pages.</p>
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-12 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
                            <div className="w-28 h-28 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-2xl shadow-green-500/10">
                                <CheckCircle2 className="w-14 h-14 text-green-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-bold text-3xl">Pages Extracted!</h3>
                                <p className="text-[#9090b0] mt-3">Your new PDF document is ready for download.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                <button
                                    onClick={triggerDownload}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-2xl shadow-rose-600/30"
                                >
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={reset}
                                    className="px-6 py-4 glass text-[#9090b0] hover:text-white rounded-xl font-medium transition-all"
                                >
                                    New Split
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: Shield, title: "Private", text: "Processing stays on your device.", color: "text-green-500" },
                        { icon: Zap, title: "Fast", text: "Instant extraction, no waiting.", color: "text-yellow-400" },
                        { icon: Scissors, title: "Precise", text: "Select ranges or single pages.", color: "text-rose-400" },
                    ].map((feature, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                            <div className="p-3 rounded-xl bg-white/5 mb-4">
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                            <p className="text-[#9090b0] text-xs leading-relaxed">{feature.text}</p>
                        </div>
                    ))}
                </div>

                {relatedTools.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-2xl font-bold text-white mb-8">Related PDF Tools</h2>
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
