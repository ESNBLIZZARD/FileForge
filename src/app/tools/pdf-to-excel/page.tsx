"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  File,
  Loader2,
  RefreshCw,
  Shield,
  Table,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import ToolCard from "@/components/tools/ToolCard";
import { tools } from "@/lib/tools";
import { trackConversion } from "@/lib/utils/track";

type ConversionState = "idle" | "uploading" | "processing" | "done" | "error";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [convState, setConvState] = useState<ConversionState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState("converted.xlsx");
  const inputRef = useRef<HTMLInputElement>(null);

  const relatedTools = tools
    .filter((tool) => tool.category === "pdf" && tool.id !== "pdf-to-excel")
    .slice(0, 4);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const selected = fileList[0];

      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setErrorMsg("Only PDF files are supported.");
        return;
      }

      if (selected.size > 100 * 1024 * 1024) {
        setErrorMsg("File exceeds the 100MB free limit.");
        return;
      }

      setErrorMsg(null);
      setFile(selected);
      setConvState("idle");

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      setDownloadUrl(null);
    },
    [downloadUrl]
  );

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const convert = async () => {
    if (!file) return;

    setConvState("uploading");
    setProgress(10);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(35);
      setConvState("processing");

      const response = await fetch("/api/convert/pdf-to-excel", {
        method: "POST",
        body: formData,
      });

      setProgress(85);

      if (!response.ok) {
        const json = await response.json().catch(() => ({ error: "Conversion failed." }));
        throw new Error(json.error || "Conversion failed.");
      }

      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `${file.name.replace(/\.pdf$/i, "")}_converted.xlsx`;
      setOutputFilename(filename);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setConvState("done");

      // Log to history
      await trackConversion(file.name, "PDF", "pdf-to-excel");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
      setConvState("error");
      setProgress(0);
    }
  };

  const triggerDownload = () => {
    if (!downloadUrl) return;
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = outputFilename;
    anchor.click();
  };

  const reset = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFile(null);
    setConvState("idle");
    setProgress(0);
    setErrorMsg(null);
    setDownloadUrl(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isConverting = convState === "uploading" || convState === "processing";

  return (
    <div className="min-h-screen px-4 pb-24 pt-24">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/tools"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-[#9090b0] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          All Tools
        </Link>

        <div className="mb-10 flex items-start gap-6">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 shadow-xl">
            <Table className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">PDF to Excel</h1>
            <p className="mt-2 leading-relaxed text-[#9090b0]">
              Extract rows and tabular text from your PDF into a downloadable{" "}
              <strong className="text-white">.xlsx</strong> spreadsheet that opens in Excel.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#9090b0]">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                File auto-deleted after processing
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Converts in under 30 seconds
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                Free · up to 100MB
              </span>
            </div>
          </div>
        </div>

        <div className="glass mb-8 rounded-2xl p-6 sm:p-8">
          {(convState === "idle" || convState === "error") && (
            <>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
                  dragging
                    ? "scale-[1.01] border-green-500 bg-green-600/10"
                    : file
                      ? "border-green-500/60 bg-green-600/5"
                      : "border-white/[0.12] bg-white/[0.02] hover:border-green-500/50 hover:bg-green-600/5"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />

                {file ? (
                  <div className="flex w-full flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-600/20">
                      <File className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="text-center">
                      <p className="max-w-xs truncate text-lg font-semibold text-white">{file.name}</p>
                      <p className="text-sm text-[#9090b0]">{formatBytes(file.size)}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-400">PDF ready</span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          reset();
                        }}
                        className="ml-3 rounded-lg p-1.5 text-[#9090b0] transition-all hover:bg-white/[0.08] hover:text-white"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600/20 transition-all duration-300 ${
                        dragging ? "scale-110 bg-green-600/30" : ""
                      }`}
                    >
                      <Upload
                        className={`h-8 w-8 text-green-400 transition-transform duration-300 ${
                          dragging ? "-translate-y-1" : ""
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">
                        {dragging ? "Drop your PDF here" : "Drag & drop your PDF"}
                      </p>
                      <p className="mt-1 text-sm text-[#9090b0]">
                        or{" "}
                        <span className="font-medium text-green-400 transition-colors hover:text-green-300">
                          click to browse
                        </span>
                      </p>
                    </div>
                    <span className="rounded bg-white/[0.06] px-2.5 py-1 text-xs text-[#9090b0]">
                      .pdf · Max 100 MB
                    </span>
                  </>
                )}
              </div>

              {errorMsg && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Conversion failed</p>
                    <p className="mt-0.5 text-xs text-red-300/80">{errorMsg}</p>
                  </div>
                </div>
              )}

              <button
                onClick={convert}
                disabled={!file}
                className={`mt-6 w-full rounded-xl py-4 text-base font-semibold text-white transition-all ${
                  file
                    ? "bg-gradient-to-r from-green-600 to-emerald-500 shadow-xl shadow-green-900/40 hover:from-green-500 hover:to-emerald-400"
                    : "cursor-not-allowed bg-white/[0.06] text-[#9090b0]"
                }`}
              >
                {file ? "Convert to Excel (.xlsx)" : "Select a PDF to convert"}
              </button>
            </>
          )}

          {isConverting && (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="relative h-28 w-28">
                <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
                <svg className="absolute inset-0 h-28 w-28 -rotate-90" viewBox="0 0 112 112">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="url(#excelGrad)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.4s ease" }}
                  />
                  <defs>
                    <linearGradient id="excelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#16a34a" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-green-400" />
                  <span className="mt-1 text-sm font-bold text-white">{progress}%</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xl font-semibold text-white">
                  {convState === "uploading" ? "Uploading PDF..." : "Extracting rows for Excel..."}
                </p>
                <p className="mt-1 text-sm text-[#9090b0]">
                  {convState === "uploading"
                    ? "Sending your PDF to the server"
                    : "Reading PDF text and building an Excel workbook"}
                </p>
              </div>

              <div className="h-1.5 w-full max-w-xs rounded-full bg-white/[0.06]">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {convState === "done" && downloadUrl && (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-green-500/30 bg-green-500/20">
                  <CheckCircle2 className="h-12 w-12 text-green-400" />
                </div>
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                  <Table className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">Conversion Complete!</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[#9090b0]">
                  Your PDF has been converted to an Excel workbook. Click below to download it.
                </p>
              </div>

              <div className="glass flex items-center gap-3 rounded-xl px-5 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-600/20">
                  <Table className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{outputFilename}</p>
                  <p className="text-xs text-[#9090b0]">.xlsx · Excel Workbook</p>
                </div>
              </div>

              <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
                <button
                  onClick={triggerDownload}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 py-3.5 font-semibold text-white shadow-xl shadow-green-900/30 transition-all hover:from-green-500 hover:to-emerald-400"
                >
                  <Download className="h-4 w-4" />
                  Download .xlsx
                </button>
                <button
                  onClick={reset}
                  className="glass flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[#9090b0] transition-all hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Convert Another
                </button>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-[#9090b0]">
                <Trash2 className="h-3.5 w-3.5" />
                Your file has been deleted from our server
              </p>
            </div>
          )}
        </div>

        <div className="mb-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "How it works",
              desc: "We read the PDF text layer, group nearby text into rows and columns, and package each page into a real Excel worksheet.",
              icon: "Grid",
            },
            {
              title: "Best for tables",
              desc: "This works best with PDFs that contain selectable text and clear tabular alignment. Scanned image PDFs will need OCR first.",
              icon: "Rows",
            },
            {
              title: "Privacy",
              desc: "Your PDF is processed on the server and removed after conversion. We do not store your content after the download is ready.",
              icon: "Lock",
            },
          ].map((item) => (
            <div key={item.title} className="glass rounded-xl p-4">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#9090b0]">{item.desc}</p>
            </div>
          ))}
        </div>

        {relatedTools.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">Related Tools</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
