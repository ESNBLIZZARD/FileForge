"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { Tool } from "@/lib/tools";

interface ToolCardProps {
    tool: Tool;
    index?: number;
}

// Dynamic icon loader helper
function ToolIcon({ name }: { name: string }) {
    // We render a styled placeholder icon using the tool's gradient color
    return (
        <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white/80">
                {name.charAt(0)}
            </span>
        </div>
    );
}

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
    return (
        <Link
            href={`/tools/${tool.id}`}
            className="group relative glass rounded-2xl p-5 flex flex-col gap-3 glass-hover cursor-pointer fade-in-up"
            style={{ animationDelay: `${(index % 8) * 0.05}s` }}
        >
            {/* Premium badge */}
            {tool.isPremium && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full px-2 py-0.5">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">Pro</span>
                </div>
            )}

            {/* New badge */}
            {tool.isNew && !tool.isPremium && (
                <div className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 rounded-full px-2 py-0.5">
                    <span className="text-xs text-green-400 font-medium">New</span>
                </div>
            )}

            {/* Icon */}
            <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
                <ToolIcon name={tool.name} />
            </div>

            {/* Info */}
            <div>
                <h3 className="text-white font-semibold text-base group-hover:text-violet-300 transition-colors leading-tight">
                    {tool.name}
                </h3>
                <p className="text-[#9090b0] text-xs mt-1 leading-relaxed line-clamp-2">
                    {tool.description}
                </p>
            </div>

            {/* Format pills */}
            <div className="flex flex-wrap gap-1.5 mt-auto">
                {tool.inputFormats.slice(0, 2).map((fmt) => (
                    <span
                        key={fmt}
                        className="text-[10px] font-medium text-[#9090b0] bg-white/[0.06] rounded px-1.5 py-0.5"
                    >
                        {fmt}
                    </span>
                ))}
                {tool.inputFormats.length > 2 && (
                    <span className="text-[10px] font-medium text-[#9090b0] bg-white/[0.06] rounded px-1.5 py-0.5">
                        +{tool.inputFormats.length - 2}
                    </span>
                )}
                <span className="text-[10px] text-[#9090b0]">→</span>
                {tool.outputFormats.slice(0, 2).map((fmt) => (
                    <span
                        key={fmt}
                        className="text-[10px] font-medium text-violet-300 bg-violet-600/20 rounded px-1.5 py-0.5"
                    >
                        {fmt}
                    </span>
                ))}
            </div>
        </Link>
    );
}
