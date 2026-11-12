"use client";

import { FormEvent, useState } from "react";
import { useSession } from "@/lib/session";
import { Button, ErrorMessage, Input, Label } from "@/components/ui";

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Could not sign in.";
  if (message.includes("INVALID_CREDENTIALS")) return "Invalid user number or password.";
  if (message.includes("ACCOUNT_LOCKED")) return "Too many attempts. Please try again later.";
  if (message.includes("USER_INACTIVE")) return "This account is deactivated. Contact an administrator.";
  return message.replace(/^.*Uncaught Error:\s*/, "");
}

export default function LoginPage() {
  const { login, ready, token } = useSession();
  const [userNumber, setUserNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!ready || token) return <main className="grid min-h-screen place-items-center text-sm text-muted">Loading…</main>;

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await login(userNumber.trim(), password); }
    catch (cause) { setError(readableError(cause)); }
    finally { setBusy(false); }
  }

  return <main className="grid min-h-screen place-items-center px-4 py-10">
    <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-card">
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-brand">Formel D · Renault</p><h1 className="mt-3 text-2xl font-bold">Quality Control</h1><p className="mt-1 text-sm text-muted">Sign in to the administration portal</p></div>
      <form onSubmit={submit} className="space-y-5">
        <div><Label>User number</Label><Input value={userNumber} onChange={e => setUserNumber(e.target.value)} autoComplete="username" inputMode="numeric" required autoFocus /></div>
        <div><Label>Password</Label><Input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" required /></div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">Accounts are provisioned by an administrator.</p>
    </div>
  </main>;
}
