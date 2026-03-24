"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  LayoutDashboard,
  History,
  TrendingUp,
  Search,
  ChevronRight
} from "lucide-react";

interface Conversion {
  id: string;
  fileName: string;
  fileType: string;
  toolUsed: string;
  createdAt: string;
  status: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/conversions");
        if (res.ok) {
          const data = await res.json();
          setConversions(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchHistory();
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#06060f] pt-32 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060f] pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{session?.user?.name || "User"}</span>!
            </h1>
            <p className="text-[#9090b0] text-lg font-medium">Manage your conversions and account activity.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-[#606080] text-xs font-bold uppercase tracking-wider">Total Files</p>
                  <p className="text-white font-black text-xl leading-none">{conversions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { 
              label: "Active Tools", 
              value: `${new Set(conversions.map(c => c.toolUsed)).size}`, 
              icon: LayoutDashboard, 
              color: "from-blue-500 to-cyan-400" 
            },
            { 
              label: "Hours Saved", 
              value: `${(conversions.length * 0.15).toFixed(1)}h`, 
              icon: Clock, 
              color: "from-violet-600 to-indigo-500" 
            },
            { 
              label: "Success Rate", 
              value: conversions.length > 0 ? "100%" : "0%", 
              icon: CheckCircle2, 
              color: "from-emerald-500 to-teal-400" 
            },
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/[0.08] transition-all duration-500">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[#8080a0] font-bold text-sm uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl shadow-black/50">
          <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <History className="w-6 h-6 text-violet-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Recent Activity</h2>
            </div>
            
            <div className="hidden md:flex relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606080] group-focus-within:text-violet-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search file history..." 
                  className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm md:w-64 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20">
                  <th className="p-6 text-[#606080] font-bold text-xs uppercase tracking-[0.2em] first:pl-10">File Name</th>
                  <th className="p-6 text-[#606080] font-bold text-xs uppercase tracking-[0.2em]">Tool</th>
                  <th className="p-6 text-[#606080] font-bold text-xs uppercase tracking-[0.2em]">Date</th>
                  <th className="p-6 text-[#606080] font-bold text-xs uppercase tracking-[0.2em]">Status</th>
                  <th className="p-6 text-[#606080] font-bold text-xs uppercase tracking-[0.2em] last:pr-10 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {conversions.length > 0 ? (
                  conversions.map((item) => (
                    <tr key={item.id} className="group hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0">
                      <td className="p-6 first:pl-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-indigo-400" />
                          </div>
                          <span className="text-white font-bold text-sm truncate max-w-[200px]">{item.fileName}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-400/20">
                          {item.toolUsed.replace('pdf-', '').replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-6 text-[#8080a0] text-sm tabular-nums">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                          <span className="text-emerald-400 text-xs font-bold">Success</span>
                        </div>
                      </td>
                      <td className="p-6 last:pr-10 text-right">
                        <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-violet-500 hover:border-violet-400 transition-all">
                          <ArrowUpRight className="w-4 h-4 text-white" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-40">
                        <History className="w-16 h-16 text-white" />
                        <div>
                          <p className="text-white font-bold text-xl uppercase tracking-widest mb-1">No Activity Yet</p>
                          <p className="text-[#9090b0] text-sm">Processed files will appear here.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 text-center bg-white/[0.01]">
             <p className="text-[#505070] text-xs font-medium uppercase tracking-[0.2em]">Showing last 50 transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
