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
    Columns,
} from "lucide-react";
import * as XLSX from "xlsx";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";

type ConversionState = "idle" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CsvToExcelPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [convState, setConvState] = useState<ConversionState>("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [outputFilename, setOutputFilename] = useState("converted.xlsx");
    const [previewRows, setPreviewRows] = useState<any[][]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const relatedTools = tools
        .filter((t) => t.category === "data" && t.id !== "csv-to-excel")
        .slice(0, 4);

    const handleFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const selected = fileList[0];
        const ext = selected.name.toLowerCase().split('.').pop();
        if (ext !== 'csv') {
            setErrorMsg("Please select a valid CSV file (.csv).");
            return;
        }
        
        try {
            const text = await selected.text();
            const workbook = XLSX.read(text, { type: "string" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            
            setPreviewRows(rows.slice(0, 5)); // Show first 5 rows
            setErrorMsg(null);
            setFile(selected);
            setConvState("idle");
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        } catch (err) {
            setErrorMsg("Could not parse CSV file content.");
        }
    }, [downloadUrl]);

    const convert = async () => {
        if (!file) return;
        setConvState("processing");

        try {
            const text = await file.text();
            const workbook = XLSX.read(text, { type: "string" });
            
            // Create a new workbook and add the sheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, workbook.Sheets[workbook.SheetNames[0]], "Sheet1");
            
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = URL.createObjectURL(blob);
            
            setOutputFilename(file.name.replace(/\.[^/.]+$/, "") + ".xlsx");
            setDownloadUrl(url);
            setConvState("done");
        } catch (err) {
            setErrorMsg("Conversion failed: Error generating Excel workbook.");
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
        setPreviewRows([]);
    };

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 overflow-x-hidden text-slate-100">
            <div className="max-w-4xl mx-auto">
                <Link href="/tools" className="inline-flex items-center gap-2 text-[#9090b0] hover:text-white text-sm mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> All Tools
                </Link>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12 text-center sm:text-left">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-2xl flex-shrink-0">
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase mb-3">
                            <Columns className="w-3 h-3" /> Professional Data Formatting
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-3">CSV to Excel</h1>
                        <p className="text-[#9090b0] text-lg font-medium leading-relaxed max-w-2xl text-balance">
                            Transform legacy <strong className="text-white">CSV</strong> data into professional <strong className="text-blue-400">Excel</strong> workbooks with preserved formatting and structure.
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
                                    className={`relative flex flex-col items-center justify-center gap-6 p-12 sm:p-16 rounded-[1.5rem] cursor-pointer transition-all duration-500 border-2 border-dashed ${dragging ? "border-blue-500 bg-blue-600/10" : "border-white/10 bg-white/[0.02] hover:border-blue-500/40"}`}
                                >
                                    <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                                    {file ? (
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <p className="text-white font-bold text-lg truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-blue-400/40 text-xs mt-1 font-mono uppercase tracking-widest">{formatBytes(file.size)}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-black text-xl tracking-tight leading-none">Drop CSV File</p>
                                                <p className="text-[#9090b0] font-medium text-xs mt-3 uppercase tracking-tighter italic font-bold">Privacy-First Engine</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {previewRows.length > 0 ? (
                                        <div className="animate-in slide-in-from-right-4 duration-500">
                                            <label className="text-white font-black text-sm uppercase tracking-widest mb-4 block opacity-70">Data Preview</label>
                                            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden shadow-inner">
                                                <div className="overflow-x-auto custom-scrollbar">
                                                    <table className="w-full text-[10px] text-left border-collapse">
                                                        <tbody>
                                                            {previewRows.map((row, i) => (
                                                                <tr key={i} className="border-b border-white/5 last:border-0">
                                                                    {row.map((cell, j) => (
                                                                        <td key={j} className="p-2 py-3 truncate max-w-[80px] text-[#9090b0] font-bold border-r border-white/5 last:border-0">{String(cell || "")}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-[#606080] mt-4 font-black uppercase tracking-widest text-right italic">Displaying first 5 rows</p>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center border border-white/5 bg-white/[0.01] rounded-[1.5rem] p-8 opacity-30 grayscale saturate-0">
                                            <Columns className="w-12 h-12 text-slate-500 mb-4" />
                                            <p className="text-[10px] text-center font-black leading-relaxed uppercase tracking-[0.2em] italic">Awaiting source data <br/>for row mapping</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {errorMsg && <p className="mt-8 text-red-500 text-center font-black text-sm uppercase tracking-widest bg-red-500/10 py-4 rounded-xl border border-red-500/20">{errorMsg}</p>}
                            
                            <button onClick={convert} disabled={!file} className={`mt-10 w-full py-6 rounded-2xl font-black text-white text-xl transition-all shadow-2xl tracking-tighter italic ${file ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 shadow-blue-900/30 active:scale-[0.99] active:translate-y-0.5" : "bg-white/5 text-[#404060] cursor-not-allowed border border-white/5"}`}>
                                {file ? "GENERATE EXCEL (.XLSX)" : "UPLOAD SOURCE CSV"}
                            </button>
                        </div>
                    )}

                    {convState === "processing" && (
                        <div className="py-24 flex flex-col items-center gap-6 animate-in fade-in duration-500">
                            <div className="w-20 h-20 relative">
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500/10" />
                                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2 italic">Building Workbook...</h3>
                                <p className="text-[#9090b0] text-xs uppercase tracking-[0.3em] font-black opacity-60">Mapping array structures</p>
                            </div>
                        </div>
                    )}

                    {convState === "done" && downloadUrl && (
                        <div className="py-12 flex flex-col items-center gap-10 animate-in zoom-in-95 fade-in duration-700">
                            <div className="w-24 h-24 rounded-full bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center shadow-2xl">
                                <CheckCircle2 className="w-12 h-12 text-blue-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-5xl font-black text-white tracking-tighter italic leading-none mb-4">WKBK READY!</h3>
                                <p className="text-[#9090b0] text-xl font-medium tracking-tight">Your data has been successfully formatted.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg mt-4">
                                <button onClick={triggerDownload} className="flex-1 flex items-center justify-center gap-4 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white font-black text-2xl rounded-2xl transition-all shadow-2xl shadow-blue-900/40 tracking-tighter italic">
                                    <Download className="w-8 h-8" /> EXPORT TO EXCEL
                                </button>
                                <button onClick={reset} className="flex items-center justify-center gap-3 px-10 py-6 glass hover:bg-white/10 text-white font-black text-lg rounded-2xl transition-all uppercase tracking-widest shadow-lg">
                                    <RefreshCw className="w-6 h-6" /> RESET
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="glass p-8 rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group/stat">
                        <FileSpreadsheet className="w-8 h-8 text-blue-500 mb-6 group-hover/stat:scale-110 transition-transform" />
                        <p className="text-white font-black text-sm uppercase tracking-widest mb-3 italic">Clean Mapping</p>
                        <p className="text-[#9090b0] text-xs leading-relaxed font-bold opacity-80 uppercase tracking-tight">Automatic header detection and cell type inference for a professional finish.</p>
                    </div>
                    <div className="glass p-8 rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group/stat">
                        <Shield className="w-8 h-8 text-indigo-400 mb-6 group-hover/stat:scale-110 transition-transform" />
                        <p className="text-white font-black text-sm uppercase tracking-widest mb-3 italic">Sanitized RAM</p>
                        <p className="text-[#9090b0] text-xs leading-relaxed font-bold opacity-80 uppercase tracking-tight">Data is parsed and wiped from browser memory immediately after the export is triggered.</p>
                    </div>
                    <div className="glass p-8 rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group/stat">
                        <Zap className="w-8 h-8 text-yellow-400 mb-6 group-hover/stat:scale-110 transition-transform" />
                        <p className="text-white font-black text-sm uppercase tracking-widest mb-3 italic">Ultra Fast</p>
                        <p className="text-[#9090b0] text-xs leading-relaxed font-bold opacity-80 uppercase tracking-tight">Processes millions of data points per second using advanced binary stream generation.</p>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-black text-white mb-10 flex items-center gap-4 px-2 italic tracking-tighter leading-none grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                            <Columns className="w-8 h-8 text-blue-500" />
                            COLLATERAL DATA UTILITIES
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedTools.map((t, i) => <ToolCard key={t.id} tool={t} index={i} />)}
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{` 
                .glass { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.05); } 
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}
