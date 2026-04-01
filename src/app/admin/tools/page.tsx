"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BarChart3, Layers, Wrench } from "lucide-react";

interface ToolAnalyticsRow {
  rank: number;
  name: string;
  count: number;
  share: number;
  lastUsedAt: string | null;
}

interface ToolsAnalyticsResponse {
  stats: {
    totalConversions: number;
  };
  toolAnalytics: ToolAnalyticsRow[];
}

type SessionUserShape = {
  role?: string;
};

export default function AdminToolsAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ToolsAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionUser = session?.user as (SessionUserShape & any) | undefined;
    if (status === "unauthenticated" || (sessionUser && sessionUser.role !== "ADMIN")) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const sessionUser = session?.user as (SessionUserShape & any) | undefined;

    const fetchToolAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/analytics", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.ok) {
          const json = (await response.json()) as ToolsAnalyticsResponse;
          setData({
            stats: {
              totalConversions: json.stats.totalConversions,
            },
            toolAnalytics: json.toolAnalytics,
          });
        }
      } catch (error) {
        console.error("Failed to fetch tool analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionUser?.role === "ADMIN") {
      fetchToolAnalytics();
    }
  }, [session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#06060f] pt-32 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const totalTools = data?.toolAnalytics.length ?? 0;

  return (
    <div className="min-h-screen bg-[#06060f] pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors mb-5 uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" />
              Back To Admin
            </Link>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-3 leading-none italic uppercase pr-2">
              Tool <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">Analytics</span>
            </h1>
            <p className="text-[#9090b0] text-lg font-medium">
              Full conversion analytics for every tool used across the platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-5">
              <Wrench className="w-6 h-6 text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8080a0]">Catalog</span>
            </div>
            <p className="text-4xl font-black text-white">{totalTools}</p>
            <p className="text-[#606080] text-xs font-bold uppercase tracking-widest mt-2">Tracked Tools</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-5">
              <Layers className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8080a0]">Volume</span>
            </div>
            <p className="text-4xl font-black text-white">{(data?.stats.totalConversions ?? 0).toLocaleString()}</p>
            <p className="text-[#606080] text-xs font-bold uppercase tracking-widest mt-2">Total Conversions</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-5">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8080a0]">Leader</span>
            </div>
            <p className="text-2xl font-black text-white truncate">{data?.toolAnalytics[0]?.name?.replaceAll("-", " ") || "None"}</p>
            <p className="text-[#606080] text-xs font-bold uppercase tracking-widest mt-2">Top Performing Tool</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl shadow-black/50">
          <div className="p-8 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">All Tool Analytics</h2>
              <p className="text-[#8080a0] text-sm mt-2">Each tool ranked by total conversions and platform share.</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-violet-400">
              {totalTools} Tools
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20">
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em] first:pl-10">Rank</th>
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em]">Tool</th>
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em]">Conversions</th>
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em]">Share</th>
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em] last:pr-10">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {data?.toolAnalytics.length ? (
                  data.toolAnalytics.map((tool) => (
                    <tr key={tool.name} className="group hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0">
                      <td className="p-6 first:pl-10">
                        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs font-black">
                          {tool.rank}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-violet-300" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm capitalize">{tool.name.replaceAll("-", " ")}</p>
                            <p className="text-[#606080] text-[10px] font-bold uppercase tracking-widest">Tool Usage Analytics</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-white font-black text-lg tabular-nums">{tool.count.toLocaleString()}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-28 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                              style={{ width: `${Math.min(tool.share, 100)}%` }}
                            />
                          </div>
                          <span className="text-violet-300 text-sm font-bold tabular-nums">{tool.share}%</span>
                        </div>
                      </td>
                      <td className="p-6 last:pr-10 text-[#9090b0] text-sm font-medium">
                        {tool.lastUsedAt
                          ? new Date(tool.lastUsedAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "No activity"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-50">
                        <BarChart3 className="w-14 h-14 text-white" />
                        <div>
                          <p className="text-white font-bold text-lg uppercase tracking-widest mb-1">No Tool Analytics Yet</p>
                          <p className="text-[#9090b0] text-sm">Once conversions are recorded, every tool will appear here.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-white/[0.01] flex items-center justify-between">
            <p className="text-[#505070] text-xs font-medium uppercase tracking-[0.2em]">
              Ranked by total conversions across the platform
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Return To Dashboard
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
