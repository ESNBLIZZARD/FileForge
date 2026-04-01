"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Upload,
    File,
    CheckCircle2,
    AlertCircle,
    Download,
    Loader2,
    Shield,
    Presentation,
    Zap,
    Image as ImageIcon,
} from "lucide-react";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";
import { trackConversion } from "@/lib/utils/track";
import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ConversionState = "idle" | "processing" | "done" | "error";
type PptxGenInstance = {
    addSlide: () => {
        addImage: (options: {
            data: string;
            x: number | string;
            y: number | string;
            w: number | string;
            h: number | string;
        }) => void;
    };
    write: (options: { outputType: "blob" }) => Promise<Blob>;
};
type PptxGenConstructor = new () => PptxGenInstance;

async function loadPptxGen(): Promise<PptxGenConstructor> {
    const existing = (window as typeof window & { PptxGenJS?: PptxGenConstructor }).PptxGenJS;
    if (existing) return existing;

    await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "/vendor/pptxgen.bundle.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load PowerPoint generator."));
        document.body.appendChild(script);
    });

    const loaded = (window as typeof window & { PptxGenJS?: PptxGenConstructor }).PptxGenJS;
    if (!loaded) {
        throw new Error("PowerPoint generator did not initialize.");
    }

    return loaded;
}

export default function PdfToPptPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.id !== "pdf-to-ppt" && (t.id === "ppt-to-pdf" || t.category === "pdf-utilities"))
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

    const convertToPpt = async () => {
        if (!file) return;
        setConvState("processing");
        setProgress(5);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const PptxGen = await loadPptxGen();
            const pres = new PptxGen();
            
            setProgress(15);

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 }); // High res for presentation
                
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (!context) throw new Error("Could not create canvas context");
                
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                
                const imgData = canvas.toDataURL("image/png");
                
                const slide = pres.addSlide();
                slide.addImage({
                    data: imgData,
                    x: 0,
                    y: 0,
                    w: "100%",
                    h: "100%",
                });

                setProgress(Math.round(15 + (i / pdf.numPages) * 75));
            }

            setProgress(95);
            
            // Generate PPTX as a Blob
            const output = await pres.write({ outputType: "blob" });
            const url = URL.createObjectURL(output as Blob);
            
            setDownloadUrl(url);
            setProgress(100);
            setConvState("done");

            // Log to history
            await trackConversion(file.name, "PDF", "pdf-to-ppt");
        } catch (err: unknown) {
            console.error("Conversion failed:", err);
            setErrorMsg("An unexpected error occurred during conversion.");
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl flex-shrink-0 text-white">
                        <Presentation className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">PDF to PowerPoint</h1>
                        <p className="text-[#9090b0] mt-2 leading-relaxed">
                            Turn your PDF pages into high-resolution slides. 
                            Uses high-fidelity rendering for <strong className="text-white">perfect layout preservation</strong>.
                        </p>
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
                                        ? "border-orange-500 bg-orange-600/10 scale-[1.01]"
                                        : file
                                            ? "border-orange-500/50 bg-orange-600/5"
                                            : "border-white/[0.12] bg-white/[0.02] hover:border-orange-500/50 hover:bg-orange-600/5"
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
                                        <div className="w-16 h-16 rounded-2xl bg-orange-600/20 flex items-center justify-center">
                                            <File className="w-8 h-8 text-orange-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold text-lg truncate max-w-xs">{file.name}</p>
                                            <p className="text-[#9090b0] text-sm mt-1">Ready for conversion</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-orange-600/20 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-orange-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold text-lg">Select PDF file</p>
                                            <p className="text-[#9090b0] text-sm mt-1">or drag and drop it here</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {file && (
                                <button
                                    onClick={convertToPpt}
                                    className="mt-8 w-full py-4 rounded-xl font-semibold text-white text-base transition-all bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-xl shadow-orange-900/40"
                                >
                                    Convert to PowerPoint
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
                                        stroke="url(#pptGrad)"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 58}`}
                                        strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                                        style={{ transition: "stroke-dashoffset 0.4s ease" }}
                                    />
                                    <defs>
                                        <linearGradient id="pptGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#ea580c" />
                                            <stop offset="100%" stopColor="#dc2626" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col text-orange-400">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-white text-base font-bold mt-2">{progress}%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-semibold text-xl">Creating Slides...</p>
                                <p className="text-[#9090b0] text-sm mt-1">Rendering high-resolution images for each slide.</p>
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-12 flex flex-col items-center gap-8 text-center animate-in zoom-in-95 duration-500">
                            <div className="w-28 h-28 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-2xl shadow-green-500/10">
                                <CheckCircle2 className="w-14 h-14 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-3xl">Ready for Presentation!</h3>
                                <p className="text-[#9090b0] mt-3">Your PowerPoint file has been generated successfully.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                <button
                                    onClick={() => {
                                        const a = document.createElement("a");
                                        a.href = downloadUrl;
                                        a.download = `${file?.name.replace(".pdf", "") || "presentation"}.pptx`;
                                        a.click();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-xl transition-all shadow-2xl shadow-orange-600/30"
                                >
                                    <Download className="w-5 h-5" />
                                    Download PPTX
                                </button>
                                <button
                                    onClick={() => { setFile(null); setConvState("idle"); setProgress(0); }}
                                    className="px-6 py-4 glass text-[#9090b0] hover:text-white rounded-xl font-medium transition-all"
                                >
                                    New File
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: Shield, title: "100% Private", text: "Files are processed in-browser.", color: "text-green-500" },
                        { icon: Zap, title: "High Quality", text: "Crystal clear retina rendering.", color: "text-yellow-400" },
                        { icon: ImageIcon, title: "Layout Match", text: "Maintains exact visual design.", color: "text-orange-400" },
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
                        <h2 className="text-2xl font-bold text-white mb-8">Related Tools</h2>
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

