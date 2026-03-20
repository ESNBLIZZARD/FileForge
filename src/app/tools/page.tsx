"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { tools, categories, ToolCategory } from "@/lib/tools";
import ToolCard from "@/components/tools/ToolCard";

export default function ToolsPage() {
    const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = useMemo(() => {
        return tools.filter((t) => {
            const matchCat = activeCategory === "all" || t.category === activeCategory;
            const matchSearch =
                searchQuery === "" ||
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.inputFormats.some((f) =>
                    f.toLowerCase().includes(searchQuery.toLowerCase())
                ) ||
                t.outputFormats.some((f) =>
                    f.toLowerCase().includes(searchQuery.toLowerCase())
                );
            return matchCat && matchSearch;
        });
    }, [activeCategory, searchQuery]);

    return (
        <div className="min-h-screen pt-24 pb-24 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        All <span className="gradient-text">Conversion Tools</span>
                    </h1>
                    <p className="text-[#9090b0] text-lg max-w-xl mx-auto">
                        {tools.length} tools across PDF, image, audio, video, and data formats.
                    </p>
                </div>

                {/* Search */}
                <div className="relative max-w-lg mx-auto mb-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9090b0]" />
                    <input
                        type="text"
                        placeholder="Search tools (e.g. PDF, MP3, JSON…)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full glass rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-[#9090b0] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                    />
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === "all"
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                                : "glass text-[#9090b0] hover:text-white hover:border-white/20"
                            }`}
                    >
                        <span>All Tools</span>
                        <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === "all"
                                    ? "bg-white/20 text-white"
                                    : "bg-violet-600/30 text-violet-300"
                                }`}
                        >
                            {tools.length}
                        </span>
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as ToolCategory)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                                    : "glass text-[#9090b0] hover:text-white hover:border-white/20"
                                }`}
                        >
                            <span>{cat.label}</span>
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id
                                        ? "bg-white/20 text-white"
                                        : "bg-violet-600/30 text-violet-300"
                                    }`}
                            >
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Results */}
                {filtered.length > 0 ? (
                    <>
                        <p className="text-[#9090b0] text-sm mb-6 flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4" />
                            Showing {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
                            {searchQuery && (
                                <span>
                                    {" "}for &quot;<strong className="text-white">{searchQuery}</strong>&quot;
                                </span>
                            )}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map((tool, i) => (
                                <ToolCard key={tool.id} tool={tool} index={i} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-white font-semibold text-xl mb-2">No tools found</h3>
                        <p className="text-[#9090b0] text-sm">
                            Try a different keyword or browse all categories.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                            className="mt-6 px-6 py-2.5 glass rounded-xl text-white text-sm hover:bg-white/[0.08] transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
