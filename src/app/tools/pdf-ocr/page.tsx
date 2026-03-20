"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    ArrowLeft, 
    ScanText, 
    Upload, 
    FileText, 
    X, 
    Loader2, 
    Copy, 
    Check,
    RefreshCw, 
    Zap,
    ShieldCheck,
    AlertCircle,
    Download
} from "lucide-react";
import { tools } from "@/lib/tools";
import ToolCard from "@/components/tools/ToolCard";

export default function OcrPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedText, setExtractedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
            setExtractedText(null);
        } else if (selectedFile) {
            setError("Please upload a valid PDF file.");
        }
    };

    const performOcr = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setExtractedText(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/convert/pdf-ocr", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to perform OCR");
            }

            const data = await response.json();
            setExtractedText(data.text);
        } catch (err: any) {
            setError(err.message || "An error occurred while performing OCR.");
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = () => {
        if (!extractedText) return;
        navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadText = () => {
        if (!extractedText) return;
        const blob = new Blob([extractedText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `extracted_text_${file?.name?.replace(".pdf", "")}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setExtractedText(null);
        setError(null);
    };

    const relatedTools = tools
        .filter((t) => t.category === "pdf-utilities" && t.id !== "pdf-ocr")
        .slice(0, 4);

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

                <div className="flex items-start gap-6 mb-10 text-left">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center shadow-xl shadow-lime-900/20 flex-shrink-0 animate-in zoom-in-50 duration-500">
                        <ScanText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">OCR PDF</h1>
                        <p className="text-[#9090b0] text-lg leading-relaxed max-w-2xl text-left">
                            Extract searchable text from scanned PDF documents with high accuracy.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 blur-[100px] -z-10 group-hover:bg-lime-500/10 transition-colors" />
                            
                            {!extractedText ? (
                                <div className="space-y-8">
                                    {!file ? (
                                        <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 transition-all hover:border-lime-500/30 hover:bg-white/[0.02] group/upload">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".pdf"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex flex-col items-center text-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-lime-500/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-500">
                                                    <Upload className="w-8 h-8 text-lime-500" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-lg">Select PDF file</p>
                                                    <p className="text-[#9090b0] text-sm mt-1">or drag and drop here</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group/file">
                                                <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-lime-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{file.name}</p>
                                                    <p className="text-[#9090b0] text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                </div>
                                                <button 
                                                    onClick={reset}
                                                    className="p-2 text-[#9090b0] hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {error && (
                                                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake-in">
                                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                                    <p className="text-red-400 text-sm leading-relaxed text-left">{error}</p>
                                                </div>
                                            )}

                                            <button
                                                onClick={performOcr}
                                                disabled={isProcessing}
                                                className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                                                    !isProcessing
                                                        ? "bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-500 hover:to-green-500 shadow-xl shadow-lime-900/40 translate-y-0 active:translate-y-0.5"
                                                        : "bg-white/5 text-[#9090b0] cursor-not-allowed"
                                                }`}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Processing OCR... (This may take a minute)
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-5 h-5" />
                                                        Extract Text Now
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-white font-bold text-xl tracking-tight">Extracted Text</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={copyToClipboard}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-sm font-medium border border-white/10"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                {copied ? "Copied!" : "Copy"}
                                            </button>
                                            <button
                                                onClick={downloadText}
                                                className="flex items-center gap-2 px-4 py-2 bg-lime-500/10 hover:bg-lime-500/20 text-lime-500 rounded-lg transition-all text-sm font-medium border border-lime-500/20"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download .txt
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-black/50 rounded-2xl p-6 border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar font-mono text-xs sm:text-sm text-[#9090b0] leading-relaxed whitespace-pre-wrap text-left shadow-inner">
                                        {extractedText}
                                    </div>

                                    <button
                                        onClick={reset}
                                        className="w-full py-4 glass text-[#9090b0] hover:text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 mt-4"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Process Another File
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-5 h-5 text-lime-500" />
                                </div>
                                <h4 className="text-white font-semibold mb-2 text-left">Secure Processing</h4>
                                <p className="text-[#9090b0] text-sm leading-relaxed text-left">
                                    Your data is processed and instantly purged. We never store your extracted text.
                                </p>
                            </div>
                            <div className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors text-left">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                                    <Zap className="w-5 h-5 text-rose-400" />
                                </div>
                                <h4 className="text-white font-semibold mb-2 text-left">High Accuracy</h4>
                                <p className="text-[#9090b0] text-sm leading-relaxed text-left">
                                    Powered by industry-standard Tesseract OCR for precise text recognition.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass rounded-3xl p-6 border border-white/10 space-y-6 text-left">
                            <h3 className="text-white font-bold text-lg text-left">How it Works</h3>
                            <div className="space-y-4">
                                {[
                                    { step: "1", text: "Upload your scanned PDF file." },
                                    { step: "2", text: "We rasterize pages for scanning." },
                                    { step: "3", text: "OCR extracts text from images." },
                                    { step: "4", text: "Copy or download your text instantly." }
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <span className="w-6 h-6 rounded-full bg-lime-500/20 text-lime-500 text-xs font-bold flex items-center justify-center shrink-0">
                                            {item.step}
                                        </span>
                                        <p className="text-[#9090b0] text-sm">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-lime-500/5 to-transparent text-left">
                            <h3 className="text-white font-bold text-lg mb-4 text-left">Best Results</h3>
                            <p className="text-[#9090b0] text-sm leading-relaxed text-left">
                                For optimal accuracy, ensure your document is clear, well-lit, and in high resolution. Currently optimized for English text.
                            </p>
                        </div>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-white mb-8 text-left">More PDF Utilities</h2>
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
