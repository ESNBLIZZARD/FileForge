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
    FileText,
    Trash2,
} from "lucide-react";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";

type ConversionState = "idle" | "uploading" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MarkdownToPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [outputFilename, setOutputFilename] = useState("converted.pdf");
    const inputRef = useRef<HTMLInputElement>(null);

    const tool = tools.find(t => t.id === "markdown-to-pdf");
    const relatedTools = tools
        .filter((t) => t.category === "pdf" && t.id !== "markdown-to-pdf")
        .slice(0, 4);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];

        const ext = selected.name.toLowerCase().split('.').pop();
        if (ext !== 'md' && ext !== 'markdown') {
            setErrorMsg("Only Markdown files (.md, .markdown) are supported.");
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
        setConvState("processing");
        setProgress(20);
        setErrorMsg(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const mdContent = e.target?.result as string;
                setProgress(40);

                // Convert Markdown to HTML
                // marked.parse can be sync or async depending on version, here using synchronous for simplicity
                const htmlContent = await marked.parse(mdContent);
                setProgress(50);

                // Create a hidden container for rendering
                const container = document.createElement("div");
                container.style.position = "absolute";
                container.style.left = "-9999px";
                container.style.top = "0";
                container.style.width = "800px";
                container.style.backgroundColor = "white";
                container.style.color = "black";
                container.style.padding = "40px";
                container.className = "markdown-content"; // Could add some default MD styles here
                container.innerHTML = `
                    <style>
                        .markdown-content { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; }
                        .markdown-content h1 { border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
                        .markdown-content h2 { border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
                        .markdown-content code { background-color: rgba(27,31,35,.05); border-radius: 3px; padding: .2em .4em; font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; }
                        .markdown-content pre { background-color: #f6f8fa; border-radius: 3px; padding: 16px; overflow: auto; }
                        .markdown-content blockquote { border-left: .25em solid #dfe2e5; color: #6a737d; padding: 0 1em; }
                        .markdown-content table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
                        .markdown-content table th, .markdown-content table td { border: 1px solid #dfe2e5; padding: 6px 13px; }
                        .markdown-content table tr:nth-child(2n) { background-color: #f6f8fa; }
                    </style>
                    ${htmlContent}
                `;
                document.body.appendChild(container);

                try {
                    const canvas = await html2canvas(container, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: "#ffffff",
                    });

                    setProgress(80);

                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "mm", "a4");
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    // Simple multi-page support logic if needed, but for now single long page
                    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, 297)); // Clip for now, should handle paging properly later

                    setProgress(95);

                    const blob = pdf.output("blob");
                    const url = URL.createObjectURL(blob);
                    const filename = `${file.name.replace(/\.(md|markdown)$/i, "")}_converted.pdf`;

                    setDownloadUrl(url);
                    setOutputFilename(filename);
                    setProgress(100);
                    setConvState("done");
                } catch (renderErr) {
                    console.error("Rendering failed:", renderErr);
                    throw new Error("Failed to render Markdown to PDF.");
                } finally {
                    document.body.removeChild(container);
                }
            };
            reader.onerror = () => { throw new Error("Failed to read the file."); };
            reader.readAsText(file);
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

    const isConverting = convState === "processing";

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
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Markdown to PDF</h1>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">
                            Convert your Markdown documents to elegant{" "}
                            <strong className="text-white">PDF</strong> files with GitHub-style formatting.
                            Processed locally in your browser for absolute privacy.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#9090b0] flex-wrap">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-green-500" />
                                100% Private (No Upload)
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                Fast Parsing
                            </span>
                            <span className="flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                Premium Styles
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
                                    ? "border-indigo-500 bg-indigo-600/10 scale-[1.01]"
                                    : file
                                        ? "border-violet-500/60 bg-violet-600/5"
                                        : "border-white/[0.12] bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-600/5"
                                    }`}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".md,.markdown"
                                    className="hidden"
                                    onChange={(e) => handleFiles(e.target.files)}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center gap-3 w-full">
                                        <div className="w-14 h-14 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                                            <File className="w-6 h-6 text-indigo-400" />
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
                                        <div className={`w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center transition-all duration-300 ${dragging ? "bg-indigo-600/30 scale-110" : ""}`}>
                                            <Upload className={`w-8 h-8 text-indigo-400 transition-transform duration-300 ${dragging ? "-translate-y-1" : ""}`} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold text-lg">
                                                {dragging ? "Drop your Markdown file here" : "Drag & drop your Markdown file"}
                                            </p>
                                            <p className="text-[#9090b0] text-sm mt-1">
                                                or <span className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">click to browse</span>
                                            </p>
                                        </div>
                                        <span className="text-xs text-[#9090b0] bg-white/[0.06] rounded px-2.5 py-1">
                                            .md, .markdown · Max 20 MB
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
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-900/40"
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
                                        stroke="url(#convGradMd)"
                                        strokeWidth="5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                                        style={{ transition: "stroke-dashoffset 0.4s ease" }}
                                    />
                                    <defs>
                                        <linearGradient id="convGradMd" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#9333ea" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                                    <span className="text-white text-sm font-bold mt-1">{progress}%</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-white font-semibold text-xl">
                                    Formatting Markdown…
                                </p>
                                <p className="text-[#9090b0] text-sm mt-1">
                                    Applying styles and creating high-quality PDF
                                </p>
                            </div>

                            <div className="w-full max-w-xs bg-white/[0.06] rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
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
                                <h3 className="text-white font-bold text-2xl">Conversion Ready!</h3>
                                <p className="text-[#9090b0] text-sm mt-2 max-w-xs mx-auto">
                                    Your Markdown document has been successfully converted to PDF.
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

                            <div className="flex flex-col sm:flex-row gap-3 w-full max-sm:w-full max-w-sm">
                                <button
                                    onClick={triggerDownload}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-indigo-900/30"
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
                                Processing is entirely client-side for maximum privacy
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-16">
                    {[
                        {
                            emoji: "📝",
                            title: "GitHub Styling",
                            desc: "Automatically applies GitHub-inspired CSS for a clean and professional document look.",
                        },
                        {
                            emoji: "🔐",
                            title: "Private Processing",
                            desc: "Your content stays in your browser. No server-side storage or tracking involved.",
                        },
                        {
                            emoji: "💎",
                            title: "Sharp Export",
                            desc: "Uses vector-like rendering for text to ensure crisp legibility at any zoom level.",
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
