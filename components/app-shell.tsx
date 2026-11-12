"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useSession } from "@/lib/session";

const links = [
  ["/dashboard", "Overview"],
  ["/users", "Users"],
  ["/mos", "Mission orders"],
  ["/submissions", "Submissions"],
  ["/stats", "Statistics"],
  ["/audit", "Audit log"],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { user, logout } = useSession();
  return <div className="min-h-screen lg:flex">
    <aside className="border-b border-line bg-white px-5 py-4 lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
      <Link href="/dashboard" className="block"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-brand">Formel D · Renault</span><strong className="mt-1 block text-lg">Quality Control</strong></Link>
      <nav className="mt-5 flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col">{links.map(([href, label]) => <Link key={href} href={href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${path.startsWith(href) ? "bg-blue-50 text-brand" : "text-muted hover:bg-canvas hover:text-ink"}`}>{label}</Link>)}</nav>
      <div className="mt-auto hidden border-t border-line pt-4 lg:block"><p className="truncate text-sm font-semibold">{user?.displayName}</p><p className="mt-1 text-xs capitalize text-muted">{user?.role}</p><button onClick={() => void logout()} className="mt-3 text-sm font-medium text-muted hover:text-ink">Sign out</button></div>
    </aside>
    <div className="min-w-0 flex-1 lg:ml-64"><header className="flex items-center justify-between border-b border-line bg-white px-5 py-3 lg:hidden"><span className="truncate text-sm font-semibold">{user?.displayName}</span><button onClick={() => void logout()} className="text-sm text-muted">Sign out</button></header><main className="mx-auto max-w-7xl p-4 sm:p-7">{children}</main></div>
  </div>;
}
