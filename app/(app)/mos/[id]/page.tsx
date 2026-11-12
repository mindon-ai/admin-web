"use client";

import { use, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { Button, Card, Input } from "@/components/ui";
import { dateTime, number, percent } from "@/lib/format";
import { useSession } from "@/lib/session";

export default function MissionOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useSession();
  const moId = id as Id<"missionOrders">;
  const details = useQuery(api.mo.get, token ? { token, moId } : "skip");
  const [problem, setProblem] = useState(""); const [error, setError] = useState(""); const [edit, setEdit] = useState<{ id: Id<"problems">; label: string } | null>(null);
  const upsert = useMutation(api.problems.upsert); const setActive = useMutation(api.problems.setActive); const reorder = useMutation(api.problems.reorder); const updateMo = useMutation(api.mo.update); const setStatus = useMutation(api.mo.setStatus); const removeMo = useMutation(api.mo.remove);
  if (details === undefined) return <p className="p-10 text-sm text-muted">Loading mission order…</p>;
  if (!details) return <div><Link href="/mos" className="text-sm text-brand">← Mission orders</Link><p className="mt-6">Mission order not found.</p></div>;
  const { mo, problems, totals } = details;
  const editable = mo.status === "draft" || mo.status === "active";

  async function act(fn: () => Promise<unknown>) { setError(""); try { await fn(); } catch (cause) { setError(cause instanceof Error ? cause.message.replace(/^.*Uncaught Error:\s*/, "") : "Action failed."); } }
  async function saveProblem() { if (!token || !problem.trim()) return; await act(async () => { await upsert({ token, moId, problemId: edit?.id, label: problem.trim() }); setProblem(""); setEdit(null); }); }
  async function move(index: number, delta: number) { const next = [...problems].sort((a,b) => a.sortOrder-b.sortOrder); const target = index + delta; if (target < 0 || target >= next.length || !token) return; [next[index], next[target]] = [next[target], next[index]]; await act(() => reorder({ token, moId, orderedProblemIds: next.map(p => p._id) })); }
  async function changeStatus(next: "active" | "closed" | "archived") { if (!token || !window.confirm(`Change ${mo.moNumber} to ${next}? ${next === "closed" ? "Operators will no longer be able to submit." : ""}`)) return; await act(() => setStatus({ token, moId, status: next })); }
  async function saveTitle(value: string) { if (!token || value === mo.title || !value.trim()) return; await act(() => updateMo({ token, moId, title: value.trim() })); }

  return <div><Link href="/mos" className="text-sm font-medium text-brand">← Mission orders</Link>
    <div className="mb-6 mt-4 flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{mo.moNumber}</h1><span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold capitalize">{mo.status}</span></div><p className="mt-1 text-muted">{mo.title}{mo.partReference ? ` · ${mo.partReference}` : ""}</p></div><div className="flex gap-2">{mo.status === "draft" && <Button onClick={() => void changeStatus("active")}>Activate</Button>}{mo.status === "active" && <Button className="bg-amber-600" onClick={() => void changeStatus("closed")}>Close MO</Button>}{mo.status === "closed" && <><Button onClick={() => void changeStatus("active")}>Reopen</Button><Button className="bg-gray-600" onClick={() => void changeStatus("archived")}>Archive</Button></>}</div></div>
    {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-muted">Submissions</p><p className="mt-2 text-2xl font-bold">{number(totals.submissions)}</p></Card><Card><p className="text-sm text-muted">Parts inspected</p><p className="mt-2 text-2xl font-bold">{number(totals.quantity)}</p></Card><Card><p className="text-sm text-muted">Defect rate</p><p className="mt-2 text-2xl font-bold">{totals.quantity ? percent(totals.defects / totals.quantity) : "—"}</p></Card></div>
    <div className="grid gap-5 xl:grid-cols-2"><Card><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Problem list</h2><p className="mt-1 text-sm text-muted">{problems.filter(p => p.isActive).length} active · labels are snapshotted in history</p></div></div>
      {editable && <div className="my-4 flex gap-2"><Input value={problem} onChange={e => setProblem(e.target.value)} placeholder="Add a defect type…" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void saveProblem(); } }} /><Button onClick={() => void saveProblem()} disabled={!problem.trim()}>Add</Button></div>}
      <div className="divide-y divide-line">{[...problems].sort((a,b) => a.sortOrder-b.sortOrder).map((p,index) => <div key={p._id} className="flex flex-wrap items-center gap-2 py-3"><span className="w-6 text-xs text-muted">{index+1}</span>{edit?.id === p._id ? <Input className="max-w-xs" value={problem} onChange={e => setProblem(e.target.value)} /> : <span className={`flex-1 text-sm font-medium ${p.isActive ? "" : "text-muted line-through"}`}>{p.label}</span>}<span className="text-xs text-muted">Used in {p.usedInCapped ? `${p.usedIn}+` : p.usedIn} submissions</span>{editable && <><button title="Move up" onClick={() => void move(index,-1)} className="px-1 text-muted">↑</button><button title="Move down" onClick={() => void move(index,1)} className="px-1 text-muted">↓</button>{edit?.id === p._id ? <button onClick={() => void saveProblem()} className="text-xs font-semibold text-brand">Save</button> : <button onClick={() => { setEdit({id:p._id,label:p.label}); setProblem(p.label); }} className="text-xs font-semibold text-brand">Rename</button>}<button onClick={() => void act(() => setActive({token: token!, problemId:p._id, isActive:!p.isActive}))} className="text-xs font-semibold text-muted">{p.isActive ? "Deactivate" : "Activate"}</button></>}</div>)}</div>
      {problems.length === 0 && <p className="py-5 text-sm text-muted">No problem types yet. Add one before activating this order.</p>}</Card>
      <Card><h2 className="text-lg font-bold">Mission order details</h2><p className="mt-1 text-sm text-muted">Created {dateTime(mo.createdAt)}</p><div className="mt-5 space-y-3"><div><label className="mb-1 block text-xs font-semibold uppercase text-muted">Title {mo.status === "draft" || mo.status === "active" ? "· press Enter to save" : ""}</label><Input key={mo.title} defaultValue={mo.title} disabled={mo.status === "closed" || mo.status === "archived"} onBlur={e => void saveTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} /></div><div><label className="mb-1 block text-xs font-semibold uppercase text-muted">Description</label><p className="rounded-lg bg-canvas p-3 text-sm">{mo.description || "No description"}</p></div><p className="text-xs text-muted">Customer: {mo.customer} · Active problems: {mo.activeProblemCount}</p></div>
      {mo.status === "draft" && !details.hasInspections && <button onClick={() => { if (token && window.confirm("Permanently delete this empty draft?")) void act(() => removeMo({token, moId})); }} className="mt-5 text-sm font-semibold text-red-600">Delete draft</button>}</Card></div>
  </div>;
}
