"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

type User = { id: Id<"users">; displayName: string; role: "admin" | "operator"; mustChangePassword: boolean };
type ContextValue = {
  token: string | null;
  user: User | null;
  ready: boolean;
  login: (userNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};
const SessionContext = createContext<ContextValue | null>(null);
const STORAGE_KEY = "formel-d-session";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const loginAction = useAction(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);
  const changePasswordAction = useAction(api.auth.changePassword);
  const me = useQuery(api.auth.me, token ? { token } : "skip") as User | null | undefined;

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { token?: string; expiresAt?: number };
        if (parsed.token && (parsed.expiresAt ?? 0) > Date.now()) setToken(parsed.token);
        else sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (token && me === null) {
      sessionStorage.removeItem(STORAGE_KEY);
      setToken(null);
    }
  }, [token, me]);

  const login = useCallback(async (userNumber: string, password: string) => {
    const result = await loginAction({ userNumber, password, clientType: "web" });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: result.token, expiresAt: result.expiresAt }));
    setToken(result.token);
  }, [loginAction]);

  const logout = useCallback(async () => {
    const activeToken = token;
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
    if (activeToken) await logoutMutation({ token: activeToken }).catch(() => undefined);
    router.replace("/login");
  }, [logoutMutation, router, token]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error("You are signed out");
    await changePasswordAction({ token, currentPassword, newPassword });
  }, [changePasswordAction, token]);

  useEffect(() => {
    // A skipped query is `undefined` when there is no token. Only wait for `me`
    // once a session exists; otherwise unauthenticated routes never redirect.
    if (!ready || (token !== null && me === undefined)) return;
    if (!token && pathname !== "/login") router.replace("/login");
    else if (token && me && pathname === "/login") router.replace(me.mustChangePassword ? "/change-password" : "/dashboard");
    else if (token && me && me.mustChangePassword && pathname !== "/change-password") router.replace("/change-password");
    else if (token && me && !me.mustChangePassword && pathname === "/change-password") router.replace("/dashboard");
  }, [me, pathname, ready, router, token]);

  const value = useMemo(() => ({ token, user: me ?? null, ready, login, logout, changePassword }), [token, me, ready, login, logout, changePassword]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
