"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileKey, Activity, Settings } from "lucide-react";

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/vault", label: "File Vault", icon: FileKey },
    { href: "/dashboard/security", label: "Security Center", icon: Activity },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin Panel", icon: Settings });
  }

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {navItems.map((item) => {
        // Exact match for dashboard, prefix match for others to keep them highlighted on subpages
        const isActive = item.href === "/dashboard" 
          ? pathname === "/dashboard" 
          : pathname.startsWith(item.href);
          
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-5 h-5" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
