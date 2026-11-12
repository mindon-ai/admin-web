"use client";

import { FormEvent, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { useSession } from "@/lib/session";

export default function UsersPage() {
  const { token } = useSession();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"admin" | "operator" | "">("");
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");
  const [showCreate, setShowCreate] = useState(false);
  const users = useQuery(api.users.list, token ? { token, search: search || undefined, role: role || undefined, isActive: isActive === "" ? undefined : isActive === "true", paginationOpts: { numItems: 50, cursor: null } } : "skip");
  const setActive = useMutation(api.users.setActive);
  const createUser = useAction(api.users.create);
  const resetPassword = useAction(api.users.resetPassword);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(userId: Id<"users">, active: boolean) {
    if (!token) return;
    setBusyId(userId); setMessage("");
    try { await setActive({ token, userId, isActive: !active }); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update user."); }
    finally { setBusyId(null); }
  }
  async function reset(userId: Id<"users">) {
    if (!token || !window.confirm("Reset this user's password? Their current sessions will be revoked.")) return;
    try { const result = await resetPassword({ token, userId }); setTemporaryPassword(result.temporaryPassword); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not reset password."); }
  }

  return <div>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted">Administration</p><h1 className="mt-1 text-2xl font-bold">Users</h1><p className="mt-1 text-sm text-muted">Manage access, roles, and temporary passwords.</p></div><Button onClick={() => setShowCreate(true)}>＋ Create user</Button></div>
    <Card className="!p-0">
      <div className="flex flex-wrap gap-3 border-b border-line p-4"><Input className="max-w-sm" placeholder="Search name or user number…" value={search} onChange={e => setSearch(e.target.value)} /><Select value={role} onChange={e => setRole(e.target.value as typeof role)}><option value="">All roles</option><option value="admin">Admin</option><option value="operator">Operator</option></Select><Select value={isActive} onChange={e => setIsActive(e.target.value as typeof isActive)}><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></Select></div>
      {message && <p role="alert" className="mx-4 mt-3 rounded bg-red-50 p-3 text-sm text-red-700">{message}</p>}
      {users === undefined ? <p className="p-6 text-sm text-muted">Loading users…</p> : users.page.length === 0 ? <div className="p-10 text-center"><p className="font-semibold">No users found</p><p className="mt-1 text-sm text-muted">Try a different search or create a user.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr>{["User", "Number", "Role", "Team", "Last login", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{users.page.map(user => <tr key={user._id} className="border-t border-line"><td className="px-4 py-3"><Link className="font-semibold text-brand hover:underline" href={`/users/${user._id}`}>{user.displayName}</Link></td><td className="px-4 py-3 font-mono">{user.userNumber}</td><td className="px-4 py-3 capitalize">{user.role}</td><td className="px-4 py-3">{user.team || "—"}</td><td className="px-4 py-3">{user.lastLoginAt ? dateTime(user.lastLoginAt) : "Never"}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{user.isActive ? "Active" : "Inactive"}</span></td><td className="whitespace-nowrap px-4 py-3"><button disabled={busyId === user._id} onClick={() => void toggle(user._id, user.isActive)} className="mr-3 text-xs font-semibold text-brand">{user.isActive ? "Deactivate" : "Reactivate"}</button><button onClick={() => void reset(user._id)} className="text-xs font-semibold text-muted">Reset password</button></td></tr>)}</tbody></table><p className="border-t border-line px-4 py-3 text-xs text-muted">Showing {users.page.length} users · live results · maximum 50 per page</p></div>}
    </Card>
    {showCreate && <CreateUser token={token ?? ""} onClose={() => setShowCreate(false)} onCreate={async (fields) => { const result = await createUser({ token: token!, ...fields }); if (result.temporaryPassword) setTemporaryPassword(result.temporaryPassword); setShowCreate(false); }} />}
    {temporaryPassword && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-bold">Temporary password</h2><p className="mt-2 text-sm text-muted">Copy it now and give it to the user securely. It will not be shown again.</p><div className="my-4 rounded-lg bg-canvas p-4 text-center font-mono text-xl tracking-widest">{temporaryPassword}</div><div className="flex justify-end gap-2"><Button className="bg-gray-700" onClick={() => void navigator.clipboard?.writeText(temporaryPassword)}>Copy</Button><Button onClick={() => setTemporaryPassword("")}>Done</Button></div></div></div>}
  </div>;
}

function CreateUser({ token, onClose, onCreate }: { token: string; onClose: () => void; onCreate: (fields: { userNumber: string; displayName: string; role: "admin" | "operator"; team?: string; password?: string }) => Promise<void> }) {
  const [userNumber, setUserNumber] = useState(""); const [displayName, setDisplayName] = useState(""); const [role, setRole] = useState<"admin" | "operator">("operator"); const [team, setTeam] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { await onCreate({ userNumber, displayName, role, team: team || undefined, password: password || undefined }); } catch (cause) { setError(cause instanceof Error ? cause.message.replace(/^.*Uncaught Error:\s*/, "") : "Could not create the user."); } finally { setBusy(false); } }
  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"><form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"><div><h2 className="text-xl font-bold">Create user</h2><p className="mt-1 text-sm text-muted">A temporary password is generated if you leave it blank.</p></div><div><Label>User number</Label><Input value={userNumber} onChange={e => setUserNumber(e.target.value)} inputMode="numeric" required /></div><div><Label>Display name</Label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} required /></div><div className="grid grid-cols-2 gap-3"><div><Label>Role</Label><Select className="w-full" value={role} onChange={e => setRole(e.target.value as typeof role)}><option value="operator">Operator</option><option value="admin">Admin</option></Select></div><div><Label>Team (optional)</Label><Input value={team} onChange={e => setTeam(e.target.value)} /></div></div><div><Label>Password (optional)</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Generate a temporary password" /></div>{error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" className="bg-gray-600" onClick={onClose}>Cancel</Button><Button disabled={busy}>{busy ? "Creating…" : "Create user"}</Button></div></form></div>;
}
