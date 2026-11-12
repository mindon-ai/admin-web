"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";
import { SessionProvider } from "@/lib/session";

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    return url ? new ConvexReactClient(url) : null;
  }, []);
  if (!client) {
    return <div className="grid min-h-screen place-items-center p-8 text-center"><div className="max-w-lg rounded-xl border bg-white p-8 shadow-card"><h1 className="text-xl font-bold">Convex is not configured</h1><p className="mt-2 text-sm text-muted">Set NEXT_PUBLIC_CONVEX_URL in admin-web/.env.local to your Convex deployment URL, then restart the web server.</p></div></div>;
  }
  return <ConvexProvider client={client}><SessionProvider>{children}</SessionProvider></ConvexProvider>;
}
