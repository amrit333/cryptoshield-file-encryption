"use client";

import { useState, useEffect } from "react";
import { FileText, Lock, Unlock, Database, ShieldAlert, Loader2 } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard metrics");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading security vault analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 max-w-md mx-auto text-center">
        <p className="font-semibold mb-2">Error Loading Dashboard</p>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const { stats, activityData, fileTypeData } = data;

  const cards = [
    { title: "Total Files", icon: FileText, value: stats.totalFiles.toString(), change: "Vault files", color: "text-blue-500" },
    { title: "Encrypted Files", icon: Lock, value: stats.encryptedFiles.toString(), change: "Active crypts", color: "text-cyan-500" },
    { title: "Decryptions", icon: Unlock, value: stats.decryptedCount.toString(), change: "Total access", color: "text-emerald-500" },
    { title: "Storage Used", icon: Database, value: stats.storageFormatted, change: "Disk space", color: "text-indigo-500" },
    { title: "Security Score", icon: ShieldAlert, value: `${stats.securityScore}/100`, change: "Excellent score", color: "text-green-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((stat, i) => (
          <div key={i} className="p-6 rounded-xl bg-card border border-border shadow-sm flex flex-col hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Encryption / Decryption Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEncrypts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDecrypts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" name="Encryption" dataKey="encrypts" stroke="#06b6d4" fillOpacity={1} fill="url(#colorEncrypts)" />
                <Area type="monotone" name="Decryption" dataKey="decrypts" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDecrypts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* File Types Chart */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-6">File Types Overview</h3>
          </div>
          <div className="h-80 flex items-center justify-center">
            {fileTypeData.length === 1 && fileTypeData[0].name === "None" ? (
              <p className="text-sm text-muted-foreground">No files to display</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fileTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {fileTypeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
