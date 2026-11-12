"use client";

import { FormEvent, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { Button, Card, Input, Select } from "@/components/ui";
import { number, percent } from "@/lib/format";
import { useSession } from "@/lib/session";

const statuses = ["draft", "active", "closed", "archived"] as const;
type Status = typeof statuses[number];

export default function MissionOrdersPage() {
  const { token } = useSession();
  const [status, setStatus] = useState<Status | "">("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const result = useQuery(api.mo.listForAdmin, token ? { token, status: status || undefined, search: search || undefined, paginationOpts: { numItems: 50, cursor: null } } : "skip");
  const setMoStatus = useMutation(api.mo.setStatus);
  const createMo = useMutation(api.mo.create);

  async function transition(moId: Id<"missionOrders">, current: Status, next: Status) {
    if (!token) return;
    const consequence = next === "closed" ? "Operators will no longer be able to submit inspections." : next === "archived" ? "This MO will be hidden from normal lists." : next === "active" ? "Operators will be able to submit inspections." : "";
    if (!window.confirm(`Change status from ${current} to ${next}?${consequence ? ` ${consequence}` : ""}`)) return;
    setError(""); try { await setMoStatus({ token, moId, status: next }); } catch (cause) { setError(cause instanceof Error ? cause.message.replace(/^.*Uncaught Error:\s*/, "") : "Could not change status."); }
  }
  async function create(fields: { moNumber: string; title: string; partReference?: string; problems: { label: string }[] }) {
    if (!token) return;
    await createMo({ token, ...fields }); setCreating(false);
  }

  return <div>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted">Work setup</p><h1 className="mt-1 text-2xl font-bold">Mission orders</h1><p className="mt-1 text-sm text-muted">Configure the inspection work and its defect list.</p></div><Button onClick={() => setCreating(true)}>＋ Create mission order</Button></div>
    <div className="mb-4 flex flex-wrap gap-2">{["", ...statuses].map(s => <button key={s || "all"} onClick={() => setStatus(s as Status | "")} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${status === s ? "bg-ink text-white" : "border border-line bg-white text-muted"}`}>{s || "All"}</button>)}</div>
    <Card className="!p-0"><div className="border-b border-line p-4"><Input className="max-w-md" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search MO number, title or part reference…" /></div>{error && <p role="alert" className="m-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {result === undefined ? <p className="p-6 text-sm text-muted">Loading mission orders…</p> : result.page.length === 0 ? <div className="p-10 text-center"><p className="font-semibold">No mission orders found</p><p className="mt-1 text-sm text-muted">Create an MO to begin setting up inspections.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr>{["Mission order", "Part reference", "Status", "Submissions", "Parts", "Defect rate", "Actions"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{result.page.map(mo => <tr key={mo._id} className="border-t border-line"><td className="px-4 py-3"><Link href={`/mos/${mo._id}`} className="font-semibold text-brand hover:underline">{mo.moNumber} · {mo.title}</Link></td><td className="px-4 py-3">{mo.partReference || "—"}</td><td className="px-4 py-3"><span className="rounded-full bg-canvas px-2 py-1 text-xs font-semibold capitalize">{mo.status}</span></td><td className="px-4 py-3">{number(mo.submissionCount)}</td><td className="px-4 py-3">{number(mo.partsInspected)}</td><td className="px-4 py-3">{mo.defectRate === null ? "—" : percent(mo.defectRate)}</td><td className="whitespace-nowrap px-4 py-3">{mo.status === "draft" && <button onClick={() => void transition(mo._id, mo.status, "active")} className="mr-2 text-xs font-semibold text-brand">Activate</button>}{mo.status === "active" && <button onClick={() => void transition(mo._id, mo.status, "closed")} className="mr-2 text-xs font-semibold text-brand">Close</button>}{mo.status === "closed" && <><button onClick={() => void transition(mo._id, mo.status, "active")} className="mr-2 text-xs font-semibold text-brand">Reopen</button><button onClick={() => void transition(mo._id, mo.status, "archived")} className="text-xs font-semibold text-muted">Archive</button></>}</td></tr>)}</tbody></table><p className="border-t border-line px-4 py-3 text-xs text-muted">Showing {result.page.length} MOs · maximum 50 per page</p></div>}
    </Card>
    {creating && <CreateMo onClose={() => setCreating(false)} onCreate={create} />}
  </div>;
}

function CreateMo({ onClose, onCreate }: { onClose: () => void; onCreate: (fields: { moNumber: string; title: string; partReference?: string; problems: { label: string }[] }) => Promise<void> }) {
  const [moNumber, setMoNumber] = useState(""); const [title, setTitle] = useState(""); const [partReference, setPartReference] = useState(""); const [problemText, setProblemText] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); const problems = problemText.split("\n").map(label => label.trim()).filter(Boolean).map(label => ({ label })); setBusy(true); setError(""); try { await onCreate({ moNumber, title, partReference: partReference || undefined, problems }); } catch (cause) { setError(cause instanceof Error ? cause.message.replace(/^.*Uncaught Error:\s*/, "") : "Could not create mission order."); } finally { setBusy(false); } }
  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"><form onSubmit={submit} className="w-full max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-xl"><div><h2 className="text-xl font-bold">Create mission order</h2><p className="mt-1 text-sm text-muted">New orders start as drafts. Add at least one defect to activate it.</p></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-semibold uppercase text-muted">MO number</label><Input value={moNumber} onChange={e => setMoNumber(e.target.value)} required /></div><div><label className="mb-1 block text-xs font-semibold uppercase text-muted">Part reference</label><Input value={partReference} onChange={e => setPartReference(e.target.value)} /></div></div><div><label className="mb-1 block text-xs font-semibold uppercase text-muted">Title</label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div><div><label className="mb-1 block text-xs font-semibold uppercase text-muted">Problem list · one per line</label><textarea className="min-h-28 w-full rounded-lg border border-line p-3 text-sm" value={problemText} onChange={e => setProblemText(e.target.value)} placeholder="Scratch\nDent\nPaint defect" /></div>{error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" className="bg-gray-600" onClick={onClose}>Cancel</Button><Button disabled={busy}>{busy ? "Creating…" : "Create draft"}</Button></div></form></div>;
}
