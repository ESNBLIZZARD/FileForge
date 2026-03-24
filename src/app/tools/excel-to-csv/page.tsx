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
    Shield,
    Table,
    FileSpreadsheet,
    FileText,
    Trash2,
    Zap,
} from "lucide-react";
import * as XLSX from "xlsx";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";
import { trackConversion } from "@/lib/utils/track";

type ConversionState = "idle" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ExcelToCsvPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [outputFilename, setOutputFilename] = useState("converted.csv");
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "data" && t.id !== "excel-to-csv")
        .slice(0, 4);

    const handleFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];
        const ext = selected.name.toLowerCase().split('.').pop();
        if (!['xlsx', 'xls', 'ods'].includes(ext || '')) {
            setErrorMsg("Please select a valid Excel file (.xlsx, .xls, .ods).");
            return;
        }
        
        try {
            const data = await selected.arrayBuffer();
            const workbook = XLSX.read(data);
            setSheetNames(workbook.SheetNames);
            setSelectedSheet(workbook.SheetNames[0]);
            
            setErrorMsg(null);
            setFile(selected);
            setConvState("idle");
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        } catch (err) {
            setErrorMsg("Could not read Excel file content.");
        }
    }, [downloadUrl]);

    const convert = async () => {
        if (!file || !selectedSheet) return;
        setConvState("processing");

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[selectedSheet];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            
            setOutputFilename(file.name.replace(/\.[^/.]+$/, "") + ".csv");
            setDownloadUrl(url);
            setConvState("done");
            
            // Log to history
            await trackConversion(file.name, "Data", "excel-to-csv");
        } catch (err) {
            setErrorMsg("Conversion failed: Error parsing sheet data.");
            setConvState("error");
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
        setErrorMsg(null);
        setDownloadUrl(null);
        setSheetNames([]);
        setSelectedSheet("");
    };

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 overflow-x-hidden text-slate-100">
            <div className="max-w-4xl mx-auto">
                <Link href="/tools" className="inline-flex items-center gap-2 text-[#9090b0] hover:text-white text-sm mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> All Tools
                </Link>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12 text-center sm:text-left">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-2xl flex-shrink-0">
                        <FileSpreadsheet className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase mb-3">
                            <Zap className="w-3 h-3" /> 100% Local Conversion
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-3 font-sans">Excel to CSV</h1>
                        <p className="text-[#9090b0] text-lg font-medium leading-relaxed max-w-2xl text-balance">
                            Convert <strong className="text-white">Excel</strong> workbooks to <strong className="text-emerald-400">CSV</strong> instantly. Privacy-first data transformation with zero server overhead.
                        </p>
                    </div>
                </div>

                <div className="glass rounded-[2rem] p-6 sm:p-10 mb-10 relative overflow-hidden">
                    {convState === "idle" && (
                        <div className="animate-in fade-in duration-500">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                                    onClick={() => inputRef.current?.click()}
                                    className={`relative flex flex-col items-center justify-center gap-6 p-12 sm:p-16 rounded-[1.5rem] cursor-pointer transition-all duration-500 border-2 border-dashed ${dragging ? "border-green-500 bg-green-600/10" : "border-white/10 bg-white/[0.02] hover:border-green-500/40"}`}
                                >
                                    <input ref={inputRef} type="file" accept=".xlsx,.xls,.ods" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                                    {file ? (
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                                <FileSpreadsheet className="w-8 h-8 text-green-400" />
                                            </div>
                                            <p className="text-white font-bold text-lg truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-[#606080] text-xs mt-1 font-mono uppercase tracking-widest">{formatBytes(file.size)}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-black text-xl tracking-tight">Drop Excel File</p>
                                                <p className="text-[#9090b0] font-medium text-xs mt-2 uppercase tracking-tighter">XLSX, XLS, ODS</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {sheetNames.length > 0 && (
                                        <div className="animate-in slide-in-from-right-4 duration-500">
                                            <label className="text-white font-black text-sm uppercase tracking-widest mb-4 block opacity-70">Detecting Sheets</label>
                                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                                {sheetNames.map((name) => (
                                                    <button
                                                        key={name}
                                                        onClick={() => setSelectedSheet(name)}
                                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${selectedSheet === name ? "bg-green-500/15 border-green-500/40" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
                                                    >
                                                        <div className="flex items-center gap-3 truncate">
                                                            <Table className={`w-4 h-4 ${selectedSheet === name ? "text-green-400" : "text-[#606080]"}`} />
                                                            <span className={`text-sm font-bold truncate ${selectedSheet === name ? "text-white" : "text-[#9090b0]"}`}>{name}</span>
                                                        </div>
                                                        {selectedSheet === name && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-[#606080] mt-4 font-bold uppercase tracking-widest px-1">Tip: CSV supports one sheet at a time.</p>
                                        </div>
                                    )}
                                    {!file && (
                                        <div className="h-full flex flex-col items-center justify-center border border-white/5 bg-white/[0.01] rounded-2xl p-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                                            <FileText className="w-10 h-10 text-slate-500 mb-4" />
                                            <p className="text-[10px] text-center font-black leading-relaxed uppercase tracking-widest">Select a document to reveal <br/>sheet structure</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {errorMsg && <p className="mt-8 text-red-500 text-center font-black text-sm uppercase tracking-widest bg-red-500/10 py-4 rounded-xl border border-red-500/20">{errorMsg}</p>}
                            
                            <button onClick={convert} disabled={!file || !selectedSheet} className={`mt-10 w-full py-6 rounded-2xl font-black text-white text-xl transition-all shadow-2xl ${file ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 shadow-green-900/30 active:scale-[0.99]" : "bg-white/5 text-[#404060] cursor-not-allowed border border-white/5"}`}>
                                CONVERT TO CSV
                            </button>
                        </div>
                    )}

                    {convState === "processing" && (
                        <div className="py-24 flex flex-col items-center gap-6 animate-in fade-in duration-500">
                            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-white tracking-tight">Parsing Cell Data...</h3>
                                <p className="text-[#9090b0] text-sm mt-1 uppercase tracking-[0.2em] font-bold">Sheet: {selectedSheet}</p>
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-12 flex flex-col items-center gap-10 animate-in zoom-in-95 fade-in">
                            <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-900/10">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-black text-white tracking-tight leading-none">Excel Parsed!</h3>
                                <p className="text-[#9090b0] text-lg mt-4 font-medium italic opacity-80">"{selectedSheet}" exported to CSV format.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg mt-4">
                                <button onClick={triggerDownload} className="flex-1 flex items-center justify-center gap-4 py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-[1.02] text-white font-black text-xl rounded-2xl transition-all shadow-2xl shadow-green-900/40 tracking-tighter italic">
                                    <Download className="w-7 h-7" /> DOWNLOAD CSV
                                </button>
                                <button onClick={reset} className="flex items-center justify-center gap-3 px-10 py-6 glass hover:bg-white/10 text-white font-black text-lg rounded-2xl transition-all uppercase tracking-widest">
                                    <RefreshCw className="w-6 h-6" /> NEW EXCEL
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="glass p-6 rounded-2xl border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                        <Shield className="w-6 h-6 text-green-500 mb-4" />
                        <p className="text-white font-black text-sm uppercase tracking-widest mb-2">Zero Tracking</p>
                        <p className="text-[#9090b0] text-xs leading-relaxed font-bold">Your spreadsheet data never hits a server. Even the sheet structure stays in RAM.</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                        <Table className="w-6 h-6 text-emerald-400 mb-4" />
                        <p className="text-white font-black text-sm uppercase tracking-widest mb-2">Multi-Sheet</p>
                        <p className="text-[#9090b0] text-xs leading-relaxed font-bold">Easily switch between worksheets in complex workbooks before exporting.</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                        <Zap className="w-6 h-6 text-yellow-400 mb-4" />
                        <p className="text-white font-black text-sm uppercase tracking-widest mb-2">Raw Power</p>
                        <p className="text-[#9090b0] text-xs leading-relaxed font-bold">Powered by the optimized SheetJS engine for sub-second parsing of large files.</p>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4 px-2 italic tracking-tighter leading-none">
                            <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 text-sm">#</span>
                            RELATED DATA TOOLS
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedTools.map((t, i) => <ToolCard key={t.id} tool={t} index={i} />)}
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{` 
                .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.06); } 
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.5); }
            `}</style>
        </div>
    );
}
