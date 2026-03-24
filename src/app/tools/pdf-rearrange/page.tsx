"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
    ArrowLeft, 
    Upload, 
    FileText, 
    X, 
    Loader2, 
    Download, 
    RefreshCw, 
    RotateCw,
    RotateCcw,
    Trash2,
    Eye,
    Save,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { tools } from "@/lib/tools";
import { trackConversion } from "@/lib/utils/track";
import ToolCard from "@/components/tools/ToolCard";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";

// Set worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageThumbnail {
    id: string; // Unique ID for Reorder
    originalIndex: number; // 0-based
    thumbnailUrl: string;
    rotation: number; // in degrees (0, 90, 180, 270)
}

export default function RearrangePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageThumbnail[]>([]);
    const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
            generateThumbnails(selectedFile);
        } else if (selectedFile) {
            setError("Please upload a valid PDF file.");
        }
    };

    const generateThumbnails = async (pdfFile: File) => {
        setIsGeneratingThumbnails(true);
        setPages([]);
        setError(null);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            const thumbnails: PageThumbnail[] = [];
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                
                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                    }).promise;
                    
                    thumbnails.push({
                        id: `page-${i}-${Date.now()}`,
                        originalIndex: i - 1,
                        thumbnailUrl: canvas.toDataURL(),
                        rotation: 0
                    });
                }
            }
            
            setPages(thumbnails);
        } catch (err: any) {
            console.error("Thumbnail generation error:", err);
            setError("Failed to load PDF pages. The file might be corrupted or protected.");
        } finally {
            setIsGeneratingThumbnails(false);
        }
    };

    const rotatePage = (id: string, direction: "cw" | "ccw") => {
        setPages(prev => prev.map(p => {
            if (p.id === id) {
                let newRotation = direction === "cw" ? p.rotation + 90 : p.rotation - 90;
                if (newRotation >= 360) newRotation = 0;
                if (newRotation < 0) newRotation = 270;
                return { ...p, rotation: newRotation };
            }
            return p;
        }));
    };

    const deletePage = (id: string) => {
        setPages(prev => prev.filter(p => p.id !== id));
    };

    const movePage = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= pages.length) return;
        const newPages = [...pages];
        const [movedPage] = newPages.splice(fromIndex, 1);
        newPages.splice(toIndex, 0, movedPage);
        setPages(newPages);
    };

    const saveChanges = async () => {
        if (!file || pages.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            const originalBuffer = await file.arrayBuffer();
            const originalPdf = await PDFDocument.load(originalBuffer);
            const newPdf = await PDFDocument.create();
            
            for (const pageInfo of pages) {
                // Copy the page from the original PDF
                const [copiedPage] = await newPdf.copyPages(originalPdf, [pageInfo.originalIndex]);
                
                // Apply rotation correctly
                // pdf-lib rotation is additive to the original page's rotation
                if (pageInfo.rotation !== 0) {
                    const currentRotation = copiedPage.getRotation().angle;
                    copiedPage.setRotation(degrees(currentRotation + pageInfo.rotation));
                }
                
                newPdf.addPage(copiedPage);
            }
            
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setIsProcessing(false);

            // Log to history
            await trackConversion("rearranged_document.pdf", "PDF", "pdf-rearrange");
            
            // Auto-download
            const link = document.createElement("a");
            link.href = url;
            link.download = `rearranged_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err: any) {
            console.error("Save error:", err);
            setError("An error occurred while saving the rearranged PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPages([]);
        setError(null);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    };

    const relatedTools = tools
        .filter((t) => t.category === "pdf-utilities" && t.id !== "pdf-rearrange")
        .slice(0, 4);

    return (
        <div className="min-h-screen pt-24 pb-24 px-4">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 text-[#9090b0] hover:text-white text-sm mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    All Tools
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-900/20 flex-shrink-0 animate-in zoom-in-50 duration-500">
                            <LayoutGrid className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Rearrange PDF</h1>
                            <p className="text-[#9090b0] text-lg leading-relaxed max-w-2xl text-left">
                                Reorder, rotate, or delete pages with a simple drag-and-drop interface.
                            </p>
                        </div>
                    </div>
                    
                    {file && pages.length > 0 && !isGeneratingThumbnails && (
                        <div className="flex gap-3 animate-in fade-in slide-in-from-right-4">
                            <button
                                onClick={reset}
                                className="px-6 py-3 glass text-[#9090b0] hover:text-white rounded-xl transition-all font-semibold flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset
                            </button>
                            <button
                                onClick={saveChanges}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-xl shadow-purple-900/40 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isProcessing ? "Processing..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </div>

                {!file ? (
                    <div className="glass rounded-3xl p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[100px] -z-10 group-hover:bg-violet-500/10 transition-colors" />
                        <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 transition-all hover:border-violet-500/30 hover:bg-white/[0.02] group/upload">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-500">
                                    <Upload className="w-8 h-8 text-violet-500" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-lg">Select PDF file</p>
                                    <p className="text-[#9090b0] text-sm mt-1">or drag and drop here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isGeneratingThumbnails ? (
                    <div className="glass rounded-3xl p-24 border border-white/10 flex flex-col items-center gap-6">
                        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                        <div className="text-center">
                            <h3 className="text-white font-bold text-xl">Loading pages...</h3>
                            <p className="text-[#9090b0] mt-1">Generating thumbnails for your PDF.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake-in">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                <p className="text-red-400 text-sm leading-relaxed text-left">{error}</p>
                            </div>
                        )}

                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-inner">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {pages.map((page, index) => (
                                    <div 
                                        key={page.id} 
                                        className="relative group/item aspect-[3/4] animate-in fade-in zoom-in-95 duration-300"
                                    >
                                        <div className="absolute top-2 left-2 z-20 px-2 h-6 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg border border-white/20 group-hover/item:scale-110 transition-transform">
                                            Page {index + 1}
                                        </div>
                                        
                                        <div className="w-full h-full rounded-xl overflow-hidden glass border border-white/10 group-hover/item:border-violet-500/50 transition-all flex flex-col relative group/thumb shadow-lg">
                                            <div className="flex-1 overflow-hidden p-2 flex items-center justify-center bg-white/[0.02]">
                                                <img 
                                                    src={page.thumbnailUrl} 
                                                    alt={`Page ${page.originalIndex + 1}`}
                                                    className="max-w-full max-h-full transition-transform duration-300 shadow-sm rounded-sm"
                                                    style={{ transform: `rotate(${page.rotation}deg)` }}
                                                />
                                            </div>
                                            
                                            {/* Control Footer */}
                                            <div className="flex items-center justify-between p-2 bg-black/40 border-t border-white/5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <div className="flex gap-1">
                                                    <button 
                                                        onClick={() => movePage(index, index - 1)}
                                                        disabled={index === 0}
                                                        className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                        title="Move Back"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => movePage(index, index + 1)}
                                                        disabled={index === pages.length - 1}
                                                        className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                        title="Move Forward"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                
                                                <div className="flex gap-1">
                                                    <button 
                                                        onClick={() => rotatePage(page.id, "cw")}
                                                        className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors"
                                                        title="Rotate"
                                                    >
                                                        <RotateCw className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deletePage(page.id)}
                                                        className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Drag Overlay Replacement - Information */}
                                            <div className="absolute inset-0 bg-violet-600/10 pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-[#9090b0] text-sm px-4">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4" />
                                <span>Use arrows to reorder pages precisely</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>Total Pages: {pages.length}</span>
                                {pages.some(p => p.rotation !== 0) && (
                                    <span className="flex items-center gap-1 text-violet-400">
                                        <RotateCw className="w-3 h-3" />
                                        Modifications detected
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {relatedTools.length > 0 && (
                    <div className="mt-24">
                        <h2 className="text-2xl font-bold text-white mb-8 text-left border-l-4 border-violet-500 pl-4">Advanced PDF Utilities</h2>
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

// Add CSS for custom scrollbar if needed in a global file or style tag
