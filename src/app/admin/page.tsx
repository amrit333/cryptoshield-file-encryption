import { prisma } from "@/lib/prisma";
import { AdminFileTable } from "@/components/admin-file-table";
import { Users, FileText, Database, Share2, Activity, ShieldAlert } from "lucide-react";

export default async function AdminPage() {
  // 1. High level aggregates
  const totalUsers = await prisma.user.count();
  const totalFiles = await prisma.file.count();
  const activeShares = await prisma.shareLink.count();
  
  const storageAggregate = await prisma.file.aggregate({
    _sum: { size: true }
  });
  const totalSizeBytes = storageAggregate._sum.size || 0;
  
  // Format storage size
  let storageFormatted = "0 Bytes";
  if (totalSizeBytes > 0) {
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(totalSizeBytes) / Math.log(k));
    storageFormatted = parseFloat((totalSizeBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // 2. Fetch all system files with owner details
  const files = await prisma.file.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. Fetch system-wide activity logs
  const logs = await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const stats = [
    { title: "System Users", icon: Users, value: totalUsers.toString(), color: "text-blue-500", desc: "Total accounts" },
    { title: "Total Encrypted Files", icon: FileText, value: totalFiles.toString(), color: "text-cyan-500", desc: "Across all vaults" },
    { title: "Storage Allocated", icon: Database, value: storageFormatted, color: "text-indigo-500", desc: "Wiped on deletion" },
    { title: "Active Secure Links", icon: Share2, value: activeShares.toString(), color: "text-emerald-500", desc: "Public sharing nodes" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-xl bg-card border border-border flex flex-col justify-between hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Files Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold tracking-tight">System Vault Registry</h3>
          </div>
          <AdminFileTable files={files as any} />
        </div>

        {/* Global Activity Logs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500 animate-pulse" /> System Logs
          </h3>
          
          <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent system logs.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                      {log.action}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-foreground text-[13px]">{log.description}</p>
                  <div className="text-muted-foreground/80 flex items-center justify-between text-[11px]">
                    <span>User: {log.user.name || "System"}</span>
                    <span>{log.user.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
