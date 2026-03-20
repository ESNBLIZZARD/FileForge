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
    Files,
    Trash2,
    GripVertical,
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

export default function PdfMergePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "pdf" && t.id !== "pdf-merge")
        .slice(0, 4);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList) return;
        const newFiles = Array.from(fileList).filter(f => f.type === "application/pdf");
        
        if (newFiles.length === 0 && fileList.length > 0) {
            setErrorMsg("Only PDF files are supported.");
            return;
        }

        setErrorMsg(null);
        setFiles(prev => [...prev, ...newFiles]);
        setConvState("idle");
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    }, [downloadUrl]);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const mergePdfs = async () => {
        if (files.length < 2) {
            setErrorMsg("Please select at least 2 PDF files to merge.");
            return;
        }
        setConvState("processing");
        setProgress(10);
        setErrorMsg(null);

        try {
            const mergedPdf = await PDFDocument.create();
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
                
                setProgress(Math.round(10 + (i + 1) / files.length * 80));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");
        } catch (err: unknown) {
            console.error("Merge failed:", err);
            const message = err instanceof Error ? err.message : "An unexpected error occurred during merging.";
            setErrorMsg(message);
            setConvState("error");
            setProgress(0);
        }
    };

    const triggerDownload = () => {
        if (!downloadUrl) return;
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "merged_document.pdf";
        a.click();
    };

    const reset = () => {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setFiles([]);
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-xl flex-shrink-0">
                        <Files className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Merge PDF</h1>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">
                            Combine multiple PDF documents into a single, organized file. 
                            Processed locally in your browser for <strong className="text-white">total privacy</strong>.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#9090b0] flex-wrap">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-green-500" />
                                100% Client-side
                            </span>
                            <span className="flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                Instant merging
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                Unlimited files
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
                    {(convState === "idle" || convState === "error") && (
                        <>
                            <div
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onClick={() => inputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${dragging
                                        ? "border-blue-500 bg-blue-600/10 scale-[1.01]"
                                        : "border-white/[0.12] bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-600/5"
                                    }`}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleFiles(e.target.files)}
                                />
                                <div className={`w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center transition-all duration-300 ${dragging ? "bg-blue-600/30 scale-110" : ""}`}>
                                    <Upload className={`w-8 h-8 text-blue-400 transition-transform duration-300 ${dragging ? "-translate-y-1" : ""}`} />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-semibold text-lg">
                                        {dragging ? "Drop your PDFs here" : "Select PDF files to merge"}
                                    </p>
                                    <p className="text-[#9090b0] text-sm mt-1">
                                        or <span className="text-blue-400 font-medium hover:text-blue-300 transition-colors">click to browse</span>
                                    </p>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
                                            <Files className="w-4 h-4 text-blue-400" />
                                            Selected Files ({files.length})
                                        </h3>
                                        <button onClick={reset} className="text-[#9090b0] hover:text-white text-xs flex items-center gap-1 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {files.map((f, i) => (
                                            <div key={i} className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-blue-500/30 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                                                    <File className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">{f.name}</p>
                                                    <p className="text-[#9090b0] text-xs mt-0.5">{formatBytes(f.size)}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(i)}
                                                    className="p-2 rounded-lg text-[#9090b0] hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-medium text-sm">Error</p>
                                        <p className="text-red-300/80 text-xs mt-0.5">{errorMsg}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={mergePdfs}
                                disabled={files.length < 2}
                                className={`mt-8 w-full py-4 rounded-xl font-semibold text-white text-base transition-all ${files.length >= 2
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-900/40"
                                        : "bg-white/[0.06] text-[#9090b0] cursor-not-allowed"
                                    }`}
                            >
                                {files.length < 2 ? "Select at least 2 PDFs" : "Merge PDFs Now"}
                            </button>
                        </>
                    )}

                    {convState === "processing" && (
                        <div className="py-12 flex flex-col items-center gap-8">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
                                <svg className="absolute inset-0 w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                                    <circle
                                        cx="64" cy="64" r="58"
                                        stroke="url(#mergeGrad)"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 58}`}
                                        strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                                        style={{ transition: "stroke-dashoffset 0.4s ease" }}
                                    />
                                    <defs>
                                        <linearGradient id="mergeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                    <span className="text-white text-base font-bold mt-2">{progress}%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-semibold text-xl">Merging Documents…</p>
                                <p className="text-[#9090b0] text-sm mt-1 max-w-xs mx-auto">
                                    Combining {files.length} PDF files into one. This usually takes just a few seconds.
                                </p>
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-12 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
                            <div className="w-28 h-28 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-2xl shadow-green-500/10">
                                <CheckCircle2 className="w-14 h-14 text-green-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-bold text-3xl">Merged Successfully!</h3>
                                <p className="text-[#9090b0] mt-3">Your new PDF document is ready for download.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                <button
                                    onClick={triggerDownload}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-2xl shadow-blue-600/30"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Merged PDF
                                </button>
                                <button
                                    onClick={reset}
                                    className="px-6 py-4 glass text-[#9090b0] hover:text-white rounded-xl font-medium transition-all"
                                >
                                    Start Over
                                </button>
                            </div>
                            <p className="text-xs text-[#9090b0] flex items-center gap-2 bg-white/5 py-2 px-4 rounded-full">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                Processed 100% in your browser
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: Shield, title: "Zero Uploads", text: "Your confidential PDFs never leave your browser tab.", color: "text-green-500" },
                        { icon: Zap, title: "Blazing Fast", text: "Instant results leverage your device's full power.", color: "text-yellow-400" },
                        { icon: Clock, title: "No Time Limit", text: "No queues or waiting times for large file merging.", color: "text-blue-400" },
                    ].map((feature, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center group">
                            <div className={`p-3 rounded-xl bg-white/5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                            <p className="text-[#9090b0] text-xs leading-relaxed">{feature.text}</p>
                        </div>
                    ))}
                </div>

                {relatedTools.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-2xl font-bold text-white mb-8">Other PDF Tools</h2>
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
