"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/lib/session";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { ready, user, token } = useSession();
  if (!ready || (token && !user)) return <div className="grid min-h-screen place-items-center text-sm text-muted">Loading your workspace…</div>;
  if (!token || !user) return <div className="grid min-h-screen place-items-center text-sm text-muted">Redirecting to sign in…</div>;
  if (user.role !== "admin") return <div className="grid min-h-screen place-items-center p-8 text-center"><div><h1 className="text-xl font-bold">Administrator access required</h1><p className="mt-2 text-muted">Your operator account cannot access this area.</p></div></div>;
  if (user.mustChangePassword) return <div className="grid min-h-screen place-items-center text-sm text-muted">Redirecting to password change…</div>;
  return <AppShell>{children}</AppShell>;
}
