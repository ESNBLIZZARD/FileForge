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
    Sheet,
    Trash2,
} from "lucide-react";
import ToolCard from "@/components/tools/ToolCard";
import { trackConversion } from "@/lib/utils/track";
import { tools } from "@/lib/tools";

type ConversionState = "idle" | "uploading" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ExcelToPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [outputFilename, setOutputFilename] = useState("converted.pdf");
    const inputRef = useRef<HTMLInputElement>(null);

    const tool = tools.find(t => t.id === "excel-to-pdf");
    const relatedTools = tools
        .filter((t) => t.category === "pdf" && t.id !== "excel-to-pdf")
        .slice(0, 4);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];

        const ext = selected.name.toLowerCase().split('.').pop();
        if (ext !== 'xlsx' && ext !== 'xls') {
            setErrorMsg("Only Excel files (.xlsx, .xls) are supported.");
            return;
        }
        if (selected.size > 100 * 1024 * 1024) {
            setErrorMsg("File exceeds the 100MB limit.");
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
        if (!file) return;
        setConvState("uploading");
        setProgress(10);
        setErrorMsg(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            setProgress(30);
            setConvState("processing");

            const res = await fetch("/api/convert/excel-to-pdf", {
                method: "POST",
                body: formData,
            });

            setProgress(85);

            if (!res.ok) {
                const json = await res.json().catch(() => ({ error: "Conversion failed." }));
                throw new Error(json.error || "Conversion failed.");
            }

            const disposition = res.headers.get("Content-Disposition") ?? "";
            const match = disposition.match(/filename="?([^"]+)"?/);
            const filename = match?.[1] ?? `${file.name.replace(/\.(xlsx|xls)$/i, "")}_converted.pdf`;
            setOutputFilename(filename);

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");

            // Log to history
            await trackConversion(file.name, "PDF", "excel-to-pdf");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred.";
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

    const isConverting = convState === "uploading" || convState === "processing";

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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-xl flex-shrink-0">
                        <Sheet className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Excel to PDF</h1>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">
                            Convert your Excel spreadsheets to professional{" "}
                            <strong className="text-white">PDF</strong> documents. Optimized for table 
                            layouts and multi-sheet workbooks.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#9090b0] flex-wrap">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-green-500" />
                                Secure SSL processing
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                Converts in seconds
                            </span>
                            <span className="flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                Multi-sheet support
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
                                        ? "border-emerald-500 bg-emerald-600/10 scale-[1.01]"
                                        : file
                                            ? "border-violet-500/60 bg-violet-600/5"
                                            : "border-white/[0.12] bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-600/5"
                                    }`}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={(e) => handleFiles(e.target.files)}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center gap-3 w-full">
                                        <div className="w-14 h-14 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                                            <File className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold text-lg truncate max-w-xs">{file.name}</p>
                                            <p className="text-[#9090b0] text-sm">{formatBytes(file.size)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-green-400 text-sm font-medium">Ready for conversion</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); reset(); }}
                                                className="ml-3 p-1.5 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.08] transition-all"
                                                title="Remove file"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center transition-all duration-300 ${dragging ? "bg-emerald-600/30 scale-110" : ""}`}>
                                            <Upload className={`w-8 h-8 text-emerald-400 transition-transform duration-300 ${dragging ? "-translate-y-1" : ""}`} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold text-lg">
                                                {dragging ? "Drop your Excel file here" : "Drag & drop your Excel file"}
                                            </p>
                                            <p className="text-[#9090b0] text-sm mt-1">
                                                or <span className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">click to browse</span>
                                            </p>
                                        </div>
                                        <span className="text-xs text-[#9090b0] bg-white/[0.06] rounded px-2.5 py-1">
                                            .xlsx, .xls · Max 100 MB
                                        </span>
                                    </>
                                )}
                            </div>

                            {errorMsg && (
                                <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-medium text-sm">Upload Error</p>
                                        <p className="text-red-300/80 text-xs mt-0.5">{errorMsg}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={convert}
                                disabled={!file}
                                className={`mt-6 w-full py-4 rounded-xl font-semibold text-white text-base transition-all ${file
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-900/40"
                                        : "bg-white/[0.06] text-[#9090b0] cursor-not-allowed"
                                    }`}
                            >
                                {file ? "Convert to PDF" : "Select a file to convert"}
                            </button>
                        </>
                    )}

                    {isConverting && (
                        <div className="py-10 flex flex-col items-center gap-6">
                            <div className="relative w-28 h-28">
                                <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
                                <svg className="absolute inset-0 w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                                    <circle
                                        cx="56" cy="56" r="50"
                                        stroke="url(#convGradExcel)"
                                        strokeWidth="5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                                        style={{ transition: "stroke-dashoffset 0.4s ease" }}
                                    />
                                    <defs>
                                        <linearGradient id="convGradExcel" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#0d9488" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                                    <span className="text-white text-sm font-bold mt-1">{progress}%</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-white font-semibold text-xl">
                                    {convState === "uploading" ? "Uploading Spreadsheet…" : "Creating PDF Tables…"}
                                </p>
                                <p className="text-[#9090b0] text-sm mt-1">
                                    {convState === "uploading"
                                        ? "Sending your file to our secure server"
                                        : "Processing sheets and rendering high-quality tables"}
                                </p>
                            </div>

                            <div className="w-full max-w-xs bg-white/[0.06] rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-10 flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-white font-bold text-2xl">Conversion Complete!</h3>
                                <p className="text-[#9090b0] text-sm mt-2 max-w-xs mx-auto">
                                    Your Excel spreadsheet has been converted to a professional PDF.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 glass rounded-xl px-5 py-3">
                                <div className="w-9 h-9 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
                                    <File className="w-4 h-4 text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{outputFilename}</p>
                                    <p className="text-[#9090b0] text-xs">PDF Document</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                                <button
                                    onClick={triggerDownload}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-emerald-900/30"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={reset}
                                    className="flex items-center justify-center gap-2 px-5 py-3.5 glass text-[#9090b0] hover:text-white rounded-xl transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    New File
                                </button>
                            </div>

                            <p className="text-xs text-[#9090b0] flex items-center gap-1.5">
                                <Trash2 className="w-3.5 h-3.5" />
                                Files are automatically deleted after processing
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-16">
                    {[
                        {
                            emoji: "📊",
                            title: "Smart Tables",
                            desc: "Uses auto-layout to fit your spreadsheet data perfectly onto PDF pages.",
                        },
                        {
                            emoji: "📑",
                            title: "Multi-Sheet",
                            desc: "Automatically converts all sheets in your workbook, each starting on a new page.",
                        },
                        {
                            emoji: "🖥️",
                            title: "Landscape Mode",
                            desc: "Optimized for landscape orientation to handle wider spreadsheets with ease.",
                        },
                    ].map((item) => (
                        <div key={item.title} className="glass rounded-xl p-5 flex gap-4">
                            <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                            <div>
                                <p className="text-white font-semibold text-sm">{item.title}</p>
                                <p className="text-[#9090b0] text-xs mt-1 leading-relaxed">{item.desc}</p>
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
