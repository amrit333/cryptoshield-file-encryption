import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const logs = await prisma.activityLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Center</h2>
        <p className="text-muted-foreground">Monitor your account security and activity logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-card border border-border flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Risk Assessment</h3>
            <div className="text-3xl font-bold text-green-500 mb-1">98/100</div>
            <p className="text-sm text-muted-foreground">Excellent security posture.</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Password Analyzer</h3>
            <div className="text-lg font-medium text-yellow-500 mb-1">Strong</div>
            <p className="text-sm text-muted-foreground">Last changed 30 days ago.</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-cyan-500/10 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Security Recommendations</h3>
            <p className="text-sm text-muted-foreground mb-2">Enable 2FA for maximum protection.</p>
            <button className="text-xs font-medium bg-cyan-500/10 text-cyan-500 px-3 py-1.5 rounded-md hover:bg-cyan-500/20 transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-semibold">Recent Activity Logs</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                  No recent activity.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{log.description}</td>
                  <td className="px-6 py-4 text-muted-foreground text-right">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
