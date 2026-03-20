import type { Metadata } from "next";
import Link from "next/link";
import {
    FileText,
    TrendingUp,
    CheckCircle2,
    Crown,
    Download,
    ArrowRight,
    Calendar,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Dashboard — FileForge",
    description: "View your conversion history, usage stats, and manage your FileForge account.",
};

const recentConversions = [
    {
        id: 1,
        filename: "report_Q4_2025.pdf",
        from: "PDF",
        to: "DOCX",
        status: "completed",
        size: "2.4 MB",
        date: "Today, 2:15 PM",
        tool: "pdf-to-word",
    },
    {
        id: 2,
        filename: "product_photos.zip",
        from: "PNG",
        to: "WEBP",
        status: "completed",
        size: "18.6 MB",
        date: "Today, 11:03 AM",
        tool: "png-to-webp",
    },
    {
        id: 3,
        filename: "data_export.csv",
        from: "CSV",
        to: "XLSX",
        status: "completed",
        size: "512 KB",
        date: "Yesterday, 4:44 PM",
        tool: "csv-to-xlsx",
    },
    {
        id: 4,
        filename: "presentation_draft.pptx",
        from: "PPTX",
        to: "PDF",
        status: "completed",
        size: "8.1 MB",
        date: "Yesterday, 9:20 AM",
        tool: "ppt-to-pdf",
    },
    {
        id: 5,
        filename: "podcast_ep12.wav",
        from: "WAV",
        to: "MP3",
        status: "completed",
        size: "94 MB",
        date: "Feb 22, 2026",
        tool: "wav-to-mp3",
    },
];

const stats = [
    { label: "Total Conversions", value: "147", icon: TrendingUp, color: "text-violet-400" },
    { label: "Files Processed", value: "23.4 GB", icon: FileText, color: "text-cyan-400" },
    { label: "This Month", value: "38", icon: Calendar, color: "text-pink-400" },
    { label: "Saved Today", value: "4", icon: CheckCircle2, color: "text-green-400" },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen pt-24 pb-24 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Dashboard</h1>
                        <p className="text-[#9090b0] mt-1">Welcome back, Priyanka 👋</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 glass border border-white/[0.12] rounded-full px-3 py-1.5 text-sm text-[#9090b0]">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Free Plan
                        </span>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all"
                        >
                            <Crown className="w-4 h-4" />
                            Upgrade
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {stats.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="glass rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[#9090b0] text-xs font-medium">{s.label}</p>
                                    <Icon className={`w-4 h-4 ${s.color}`} />
                                </div>
                                <p className="text-white text-2xl font-bold">{s.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Usage Bar */}
                <div className="glass rounded-2xl p-6 mb-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-white font-semibold">Daily Limit</p>
                            <p className="text-[#9090b0] text-sm">4 of 5 conversions used today</p>
                        </div>
                        <Link
                            href="/pricing"
                            className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors flex items-center gap-1"
                        >
                            Upgrade for unlimited <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-2.5">
                        <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                            style={{ width: "80%" }}
                        />
                    </div>
                    <p className="text-[#9090b0] text-xs mt-2">Resets at midnight · 1 conversion remaining</p>
                </div>

                {/* Quick Actions */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-white mb-4">Quick Convert</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "PDF → Word", href: "/tools/pdf-to-word", emoji: "📄" },
                            { label: "Compress PDF", href: "/tools/compress-pdf", emoji: "🗜️" },
                            { label: "JPG → PNG", href: "/tools/jpg-to-png", emoji: "🖼️" },
                            { label: "CSV → Excel", href: "/tools/csv-to-xlsx", emoji: "📊" },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="glass rounded-xl p-4 flex flex-col items-center gap-2 text-center glass-hover"
                            >
                                <span className="text-2xl">{action.emoji}</span>
                                <span className="text-white text-xs font-medium">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Conversion History */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Recent Conversions</h2>
                        <span className="text-[#9090b0] text-sm">Last 7 days</span>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-white/[0.06] text-xs text-[#9090b0] font-medium uppercase tracking-wide">
                            <span className="col-span-2">File</span>
                            <span>Conversion</span>
                            <span>Size</span>
                            <span>Date</span>
                        </div>

                        {recentConversions.map((conv, i) => (
                            <div
                                key={conv.id}
                                className={`grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 px-5 py-4 items-center transition-colors hover:bg-white/[0.03] ${i !== recentConversions.length - 1
                                        ? "border-b border-white/[0.04]"
                                        : ""
                                    }`}
                            >
                                {/* Filename */}
                                <div className="col-span-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{conv.filename}</p>
                                        <p className="text-[#9090b0] text-xs sm:hidden">
                                            {conv.from} → {conv.to} &nbsp;·&nbsp; {conv.size} &nbsp;·&nbsp; {conv.date}
                                        </p>
                                    </div>
                                </div>
                                {/* Conversion */}
                                <div className="hidden sm:flex items-center gap-2">
                                    <span className="text-xs text-[#9090b0] bg-white/[0.06] px-2 py-0.5 rounded">
                                        {conv.from}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-[#9090b0]" />
                                    <span className="text-xs text-violet-300 bg-violet-600/20 px-2 py-0.5 rounded">
                                        {conv.to}
                                    </span>
                                </div>
                                {/* Size */}
                                <span className="hidden sm:block text-[#9090b0] text-sm">{conv.size}</span>
                                {/* Date */}
                                <div className="hidden sm:flex items-center justify-between gap-2">
                                    <span className="text-[#9090b0] text-xs">{conv.date}</span>
                                    <Link
                                        href={`/tools/${conv.tool}`}
                                        className="p-1.5 rounded-lg text-[#9090b0] hover:text-white hover:bg-white/[0.08] transition-all"
                                        title="Reuse this tool"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
