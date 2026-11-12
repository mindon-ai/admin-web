"use client";

import { FormEvent, useState } from "react";
import { useSession } from "@/lib/session";
import { Button, ErrorMessage, Input, Label } from "@/components/ui";

export default function ChangePasswordPage() {
  const { changePassword, token, user, ready } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!ready || !token || !user) return <main className="grid min-h-screen place-items-center text-sm text-muted">Loading…</main>;

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (newPassword !== confirm) { setError("The new passwords do not match."); return; }
    setBusy(true);
    try { await changePassword(currentPassword, newPassword); setDone(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message.replace(/^.*Uncaught Error:\s*/, "") : "Unable to change password."); }
    finally { setBusy(false); }
  }

  return <main className="grid min-h-screen place-items-center px-4 py-10"><div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-card">
    <p className="text-xs font-bold uppercase tracking-[.18em] text-brand">Formel D · {user.displayName}</p><h1 className="mt-3 text-2xl font-bold">Change your password</h1><p className="mt-2 text-sm text-muted">Set a personal password before continuing.</p>
    {done ? <div className="mt-6"><p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Password updated. You can now continue.</p><a className="mt-4 inline-block font-semibold text-brand" href="/dashboard">Continue to dashboard →</a></div> :
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><Label>Current / temporary password</Label><Input type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></div>
        <div><Label>New password</Label><Input type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} required /></div>
        <div><Label>Confirm new password</Label><Input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>
        {error && <ErrorMessage>{error}</ErrorMessage>}<Button className="w-full" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
      </form>}
  </div></main>;
}
