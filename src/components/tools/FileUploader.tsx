"use client";

import { useState, useCallback, useRef } from "react";
import {
    Upload,
    X,
    File,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

interface UploadedFile {
    name: string;
    size: number;
    file: File;
}

interface FileUploaderProps {
    acceptFormats: string[];
    multiple?: boolean;
    onFilesChange?: (files: UploadedFile[]) => void;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploader({
    acceptFormats,
    multiple = false,
    onFilesChange,
}: FileUploaderProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback(
        (newFiles: FileList | null) => {
            if (!newFiles) return;
            setError(null);

            const validFiles: UploadedFile[] = [];
            for (const f of Array.from(newFiles)) {
                if (f.size > 100 * 1024 * 1024) {
                    setError(`"${f.name}" exceeds the 100MB free limit.`);
                    continue;
                }
                validFiles.push({ name: f.name, size: f.size, file: f });
            }

            const updated = multiple
                ? [...files, ...validFiles]
                : validFiles.slice(0, 1);
            setFiles(updated);
            onFilesChange?.(updated);
        },
        [files, multiple, onFilesChange]
    );

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        onFilesChange?.(updated);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const onDragLeave = () => setDragging(false);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const acceptString = acceptFormats
        .map((f) => `.${f.toLowerCase()}`)
        .join(",");

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${dragging
                        ? "border-violet-500 bg-violet-600/10 scale-[1.01]"
                        : "border-white/[0.12] bg-white/[0.02] hover:border-violet-500/60 hover:bg-violet-600/5"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={acceptString}
                    multiple={multiple}
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                />

                {/* Animated upload icon */}
                <div
                    className={`w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center transition-all duration-300 ${dragging ? "bg-violet-600/30 scale-110" : ""
                        }`}
                >
                    <Upload
                        className={`w-8 h-8 text-violet-400 transition-transform duration-300 ${dragging ? "-translate-y-1" : ""
                            }`}
                    />
                </div>

                <div className="text-center">
                    <p className="text-white font-semibold text-lg">
                        {dragging ? "Drop files here" : "Drag & drop your files"}
                    </p>
                    <p className="text-[#9090b0] text-sm mt-1">
                        or{" "}
                        <span className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                            browse to upload
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    {acceptFormats.map((fmt) => (
                        <span
                            key={fmt}
                            className="text-xs text-[#9090b0] bg-white/[0.06] rounded px-2 py-0.5"
                        >
                            .{fmt.toLowerCase()}
                        </span>
                    ))}
                </div>

                <p className="text-xs text-[#9090b0]">
                    Max file size: <strong className="text-white">100MB</strong> (free)
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((f, i) => (
                        <div
                            key={`${f.name}-${i}`}
                            className="flex items-center gap-3 glass rounded-xl p-3"
                        >
                            <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                                <File className="w-4 h-4 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{f.name}</p>
                                <p className="text-[#9090b0] text-xs">{formatBytes(f.size)}</p>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                className="p-1 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.08] transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
