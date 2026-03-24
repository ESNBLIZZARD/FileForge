"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  Activity, 
  Zap, 
  ChevronRight,
  Search,
  Settings,
  ArrowUpRight,
  Database
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalConversions: number;
}

interface ToolStat {
  name: string;
  count: number;
}

interface Trend {
  date: string;
  count: number;
}

interface Conversion {
  id: string;
  fileName: string;
  fileType: string;
  toolUsed: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<{ 
    stats: Stats; 
    topTools: ToolStat[]; 
    activityTrend: Trend[];
    recentConversions: Conversion[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Failed to fetch admin analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user && (session.user as any).role !== "ADMIN")) {
      router.push("/");
    }
  }, [status, session, router]);
  useEffect(() => {
    if (session?.user && (session.user as any).role === "ADMIN") {
      fetchAnalytics();
    }
  }, [session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#06060f] pt-32 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const maxActivity = data ? Math.max(...data.activityTrend.map(t => t.count), 0) : 0;

  return (
    <div className="min-h-screen bg-[#06060f] pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin Bar */}
        <div className="flex items-center gap-3 mb-12 animate-in slide-in-from-top-4 duration-500">
           <div className="px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">Platform Admin</span>
           </div>
           <div className="h-px flex-1 bg-white/10" />
           <p className="text-[#606080] text-xs font-bold uppercase tracking-widest tabular-nums">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-3 leading-none italic uppercase">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">Analytics</span>
            </h1>
            <p className="text-[#9090b0] text-lg font-medium">Monitoring system-wide activity, users, and performance metrics.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-3">
                <Settings className="w-4 h-4" />
                Settings
             </button>
             <button 
                onClick={fetchAnalytics}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-sm hover:shadow-xl hover:shadow-violet-900/40 transition-all uppercase tracking-widest italic"
             >
                Refresh Live
             </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Users", value: data?.stats.totalUsers || 0, sub: "+12% this month", icon: Users, color: "from-blue-600 to-cyan-500" },
            { label: "Conversions", value: data?.stats.totalConversions || 0, sub: "High volume today", icon: Layers, color: "from-violet-600 to-indigo-500" },
            { label: "Storage Handled", value: "4.2 TB", sub: "Optimized usage", icon: Database, color: "from-pink-600 to-purple-500" },
            { label: "System Health", value: "99.9%", sub: "All systems go", icon: Zap, color: "from-emerald-500 to-teal-400" },
          ].map((kpi, i) => (
            <div key={i} className="glass group p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden transition-all hover:translate-y--1">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-10 blur-3xl`} />
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <kpi.icon className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                </div>
                <div className="p-1 px-2.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-[#8080a0]">LIVE</div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{kpi.value.toLocaleString()}</p>
                <p className="text-[#606080] text-xs font-bold uppercase tracking-widest">{kpi.label}</p>
              </div>
              <p className="mt-4 text-[#404060] text-xs font-bold">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Analytics Charts simulated with CSS/SVG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Trend Chart */}
          <div className="glass p-10 rounded-[3rem] border border-white/10 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-black text-white italic uppercase mb-1">Activity Trend</h3>
                  <p className="text-[#606080] text-xs font-bold uppercase tracking-widest">Last updated: {lastUpdated}</p>
               </div>
               <BarChart3 className="w-6 h-6 text-violet-500" />
            </div>

            <div className="h-[250px] flex items-end justify-between gap-2 px-2">
               {data?.activityTrend.map((t, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center group/bar">
                    <div className="relative w-full">
                       <div 
                         className="w-full bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-xl transition-all duration-700 hover:brightness-125"
                         style={{ height: `${(t.count / (maxActivity || 1)) * 200}px` }}
                       >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity">
                             {t.count}
                          </div>
                       </div>
                    </div>
                    <span className="text-[#404060] text-[10px] font-bold mt-4 uppercase rotate--45 origin-left">{t.date.split("-").slice(1).join("/")}</span>
                 </div>
               ))}
               {!data?.activityTrend.length && (
                  <div className="w-full h-full flex items-center justify-center text-[#505170] italic uppercase font-black text-sm opacity-30">
                    Insufficent Data Points
                  </div>
               )}
            </div>
          </div>

          {/* Top Tools Feed */}
          <div className="glass p-10 rounded-[3rem] border border-white/10">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white italic uppercase">Popular Toolsets</h3>
               <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            
            <div className="space-y-4">
               {data?.topTools.map((tool, i) => (
                 <div key={tool.name} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs text-white ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
                          {i + 1}
                       </div>
                       <div>
                          <p className="text-white font-bold text-sm capitalize">{tool.name.replace("-", " ")}</p>
                          <p className="text-[#606080] text-[10px] font-black uppercase tracking-widest">Global Favorite</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-white font-black text-lg tabular-nums italic">{tool.count}</span>
                       <ArrowUpRight className="w-4 h-4 text-[#404060]" />
                    </div>
                 </div>
               ))}
               {!data?.topTools.length && (
                 <div className="py-20 text-center text-[#505070] italic uppercase font-bold text-sm tracking-widest">
                    No tool activity records yet
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Global Conversion History Table */}
        <div className="glass rounded-[3rem] border border-white/10 mb-12 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white italic uppercase">Global Conversion History</h3>
                <p className="text-[#606080] text-[10px] font-black uppercase tracking-widest mt-1">Platform-wide audit log (Last 50 Events)</p>
              </div>
            </div>
            <div className="hidden md:block">
               <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[#8080a0] text-xs font-bold uppercase tracking-widest">Real-time Stream</span>
               </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20">
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em] first:pl-10">User</th>
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em]">File & Tool</th>
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="p-6 text-[#606080] font-bold text-[10px] uppercase tracking-[0.2em] last:pr-10 text-right">Reference</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentConversions && data.recentConversions.length > 0 ? (
                  data.recentConversions.map((conv) => (
                    <tr key={conv.id} className="group hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0">
                      <td className="p-6 first:pl-10">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-300">
                              {conv.user?.name?.charAt(0) || conv.user?.email?.charAt(0) || "U"}
                           </div>
                           <div>
                              <p className="text-white font-bold text-xs">{conv.user?.name || "Anonymous"}</p>
                              <p className="text-[#505070] text-[10px] font-medium">{conv.user?.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                           <p className="text-white font-bold text-xs truncate max-w-[200px]">{conv.fileName}</p>
                           <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#707090] text-[9px] font-black uppercase tracking-widest">
                              {conv.toolUsed.replace("-", " ")}
                           </span>
                        </div>
                      </td>
                      <td className="p-6">
                         <p className="text-[#8080a0] text-[11px] tabular-nums font-bold">
                            {new Date(conv.createdAt).toLocaleString(undefined, {
                               month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                         </p>
                      </td>
                      <td className="p-6 last:pr-10 text-right">
                         <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[#404060] inline-block">
                            <ArrowUpRight className="w-4 h-4" />
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                       <p className="text-[#505070] text-sm italic font-medium">No conversion records found in history</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center Footer */}
        <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 group">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-violet-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                 <h4 className="text-white font-black text-2xl tracking-tighter leading-none mb-2">Verified Administrative Node</h4>
                 <p className="text-[#8080a0] text-sm font-medium">Accessing sensitive user metrics under high-level encryption.</p>
              </div>
           </div>
           <button className="px-10 py-5 bg-white text-black font-black text-sm rounded-2xl hover:bg-violet-500 hover:text-white transition-all uppercase tracking-widest group-hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]">
              System Console
           </button>
        </div>
      </div>
      
      <style jsx>{` .glass { background: rgba(15, 15, 25, 0.4); backdrop-filter: blur(40px); } `}</style>
    </div>
  );
}
