import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LogOut, ArrowLeft, Users, FileText, Activity, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const adminNavItems = [
    { href: "/admin", label: "System Status", icon: Activity },
    { href: "/dashboard", label: "Back to Dashboard", icon: ArrowLeft },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border justify-between">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-red-500 mr-2 animate-pulse" />
            <span className="font-bold text-lg">Admin Shield</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
            ROOT
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon className="w-5 h-5" /> {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold uppercase">
              {session.user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
            </div>
          </div>
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-md font-medium transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-card">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            System Administration Center
          </h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/20">
          {children}
        </div>
      </main>
    </div>
  );
}
