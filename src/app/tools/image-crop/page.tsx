"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Upload,
    FileImage,
    X,
    Loader2,
    Download,
    RefreshCw,
    Crop as CropIcon,
    RotateCw,
    RotateCcw,
    Maximize,
    Minimize,
    CheckCircle2,
    LayoutGrid,
    RectangleHorizontal,
    Square,
    RectangleVertical
} from "lucide-react";
import { tools } from "@/lib/tools";
import ToolCard from "@/components/tools/ToolCard";
import Cropper from "react-easy-crop";

export default function ImageCropPage() {
    const [file, setFile] = useState<File | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setImage(url);
            setError(null);
            setDownloadUrl(null);
        } else if (selectedFile) {
            setError("Please upload a valid image file.");
        }
    };

    const getCroppedImg = async () => {
        if (!image || !croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const img = new Image();
            img.src = image;
            img.setAttribute('crossOrigin', 'anonymous');
            await new Promise((resolve) => { img.onload = resolve; });

            const rotRad = (rotation * Math.PI) / 180;
            
            // Calculate bounding box of the rotated image
            const bBoxWidth = Math.abs(Math.cos(rotRad) * img.width) + Math.abs(Math.sin(rotRad) * img.height);
            const bBoxHeight = Math.abs(Math.sin(rotRad) * img.width) + Math.abs(Math.cos(rotRad) * img.height);
            
            canvas.width = bBoxWidth;
            canvas.height = bBoxHeight;

            // Translate canvas context to a central point to allow rotating and flipping around the center
            ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
            ctx.rotate(rotRad);
            ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
            ctx.translate(-img.width / 2, -img.height / 2);

            // Draw rotated image
            ctx.drawImage(img, 0, 0);

            // Extract the cropped data from the rotated canvas
            // The pixelCrop (croppedAreaPixels) is relative to the bounding box of the rotated image
            const data = ctx.getImageData(
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            // Set canvas size to final crop size
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            ctx.putImageData(data, 0, 0);

            const dataUrl = canvas.toDataURL(file?.type || "image/jpeg", 0.95);
            setDownloadUrl(dataUrl);

        } catch (err) {
            console.error("Crop error:", err);
            setError("Failed to crop image.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setImage(null);
        setDownloadUrl(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlip({ horizontal: false, vertical: false });
        setError(null);
    };

    const relatedTools = tools
        .filter((t) => t.category === "image-utilities" && t.id !== "image-crop")
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

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-start gap-6 text-left">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-900/20 flex-shrink-0 animate-in zoom-in-50 duration-500">
                            <CropIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Crop & Rotate</h1>
                            <p className="text-[#9090b0] text-lg leading-relaxed max-w-2xl">
                                Precise cropping and 360° rotation with real-time visual feedback.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        {!image ? (
                            <div className="glass rounded-3xl p-24 border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors" />
                                <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 transition-all hover:border-blue-500/30 hover:bg-white/[0.02] group/upload">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-500">
                                            <Upload className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-lg">Upload Image to Edit</p>
                                            <p className="text-[#9090b0] text-sm mt-1">Start by selecting a file</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[500px] relative animate-in fade-in duration-500">
                                    <Cropper
                                        image={image}
                                        crop={crop}
                                        zoom={zoom}
                                        rotation={rotation}
                                        aspect={aspect}
                                        onCropChange={setCrop}
                                        onCropComplete={onCropComplete}
                                        onZoomChange={setZoom}
                                        showGrid={true}
                                        zoomWithScroll={true}
                                        style={{
                                            containerStyle: { background: "#0c0c14" },
                                            cropAreaStyle: { border: "2px solid #3b82f6" },
                                            mediaStyle: {
                                                transform: `rotate(${rotation}deg) scale(${zoom}) ${flip.horizontal ? "scaleX(-1)" : ""} ${flip.vertical ? "scaleY(-1)" : ""}`
                                            }
                                        }}
                                    />
                                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                                        <div className="glass backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border-white/10">
                                            {croppedAreaPixels ? `${Math.round(croppedAreaPixels.width)} × ${Math.round(croppedAreaPixels.height)}` : "Preview"}
                                        </div>
                                    </div>
                                    <button
                                        onClick={reset}
                                        className="absolute top-4 right-4 z-10 p-2 glass hover:bg-white/10 rounded-full text-[#9090b0] hover:text-white transition-colors border-white/10"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {downloadUrl && (
                                    <div className="glass rounded-2xl p-6 border border-green-500/20 bg-green-500/5 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">Crop Preview Ready</p>
                                                <p className="text-green-400/60 text-sm">Download your edited image below</p>
                                            </div>
                                        </div>
                                        <a
                                            href={downloadUrl}
                                            download={`cropped_${file?.name || "image"}`}
                                            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Now
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="glass rounded-3xl p-6 border border-white/10 shadow-xl space-y-8">
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <RectangleHorizontal className="w-4 h-4 text-blue-400" />
                                    Aspect Ratio
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "Original", val: undefined, icon: Maximize },
                                        { label: "1:1 Square", val: 1, icon: Square },
                                        { label: "4:3 Classic", val: 4 / 3, icon: RectangleHorizontal },
                                        { label: "16:9 Wide", val: 16 / 9, icon: LayoutGrid },
                                        { label: "3:4 Port", val: 3 / 4, icon: RectangleVertical }
                                    ].map((r) => (
                                        <button
                                            key={r.label}
                                            onClick={() => setAspect(r.val)}
                                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${aspect === r.val
                                                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                                    : "bg-white/5 border-white/5 text-[#9090b0] hover:text-white hover:bg-white/10"
                                                }`}
                                        >
                                            <r.icon className="w-3.5 h-3.5" />
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2 text-sm">
                                    <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                        <RotateCw className="w-4 h-4 text-blue-400" />
                                        Rotation
                                    </h3>
                                    <span className="text-blue-400 font-bold">{rotation}°</span>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                                        className="flex-1 py-2 glass rounded-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-xs"
                                        title="Rotate Counter-Clockwise"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        -90°
                                    </button>
                                    <button
                                        onClick={() => setRotation(r => (r + 90) % 360)}
                                        className="flex-1 py-2 glass rounded-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-xs"
                                        title="Rotate Clockwise"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                        +90°
                                    </button>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
                                        className={`flex-1 py-2 glass rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold ${flip.horizontal ? "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "text-white hover:bg-white/10 border-white/10"}`}
                                        title="Flip Horizontal"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Flip H
                                    </button>
                                    <button
                                        onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
                                        className={`flex-1 py-2 glass rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold ${flip.vertical ? "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "text-white hover:bg-white/10 border-white/10"}`}
                                        title="Flip Vertical"
                                    >
                                        <RefreshCw className="w-4 h-4 rotate-90" />
                                        Flip V
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    step="1"
                                    value={rotation}
                                    onChange={(e) => setRotation(parseInt(e.target.value))}
                                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div>
                                <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Minimize className="w-4 h-4 text-blue-400" />
                                    Zoom Level
                                </h3>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.1"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={getCroppedImg}
                                disabled={!image || isProcessing}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CropIcon className="w-5 h-5" />}
                                {isProcessing ? "Processing..." : "Capture Crop"}
                            </button>
                        </div>
                    </div>
                </div>

                {relatedTools.length > 0 && (
                    <div className="mt-24">
                        <h2 className="text-2xl font-bold text-white mb-8 text-left border-l-4 border-blue-500 pl-4">Complete Your Edit</h2>
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
