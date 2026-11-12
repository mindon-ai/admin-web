"use client";

import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Card, Input, Select } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { useSession } from "@/lib/session";

export default function AuditPage() {
  const {token} = useSession(); const [action,setAction] = useState(""); const [targetType,setTargetType] = useState(""); const [cursor,setCursor] = useState<string|null>(null); const [loaded,setLoaded] = useState<any[]>([]);
  const result = useQuery(api.audit.list, token ? {token,action:action||undefined,targetType:targetType||undefined,paginationOpts:{numItems:50,cursor}} : "skip");
  const items = cursor === null ? result?.page ?? [] : [...loaded,...(result?.page ?? [])];
  return <div><div className="mb-6"><p className="text-sm text-muted">Accountability</p><h1 className="mt-1 text-2xl font-bold">Audit log</h1><p className="mt-1 text-sm text-muted">Read-only history of administrative actions.</p></div><Card className="!p-0"><div className="flex flex-wrap gap-3 border-b border-line p-4"><Select value={targetType} onChange={e=>{setTargetType(e.target.value);setCursor(null);setLoaded([]);}}><option value="">All record types</option>{["user","missionOrder","problem","inspection","settings"].map(x=><option key={x}>{x}</option>)}</Select><Input className="max-w-xs" placeholder="Filter by action, e.g. mo.activate" value={action} onChange={e=>{setAction(e.target.value);setCursor(null);setLoaded([]);}} /></div>{result===undefined?<p className="p-6 text-sm text-muted">Loading audit events…</p>:items.length===0?<p className="p-8 text-center text-sm text-muted">No audit events match these filters.</p>:<><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr>{["When","Actor","Action","Target","Details"].map(x=><th className="px-4 py-3" key={x}>{x}</th>)}</tr></thead><tbody>{items.map(row=><tr key={row._id} className="border-t border-line"><td className="whitespace-nowrap px-4 py-3">{dateTime(row.at)}</td><td className="px-4 py-3">{row.actorName} <span className="text-xs text-muted">({row.actorNumber})</span></td><td className="px-4 py-3 font-mono text-xs">{row.action}</td><td className="px-4 py-3">{row.targetType} · <span className="font-mono text-xs">{row.targetId}</span></td><td className="max-w-sm px-4 py-3 text-xs text-muted">{row.details ? JSON.stringify(row.details) : "—"}</td></tr>)}</tbody></table></div><div className="flex justify-between border-t border-line px-4 py-3 text-xs text-muted"><span>Showing {items.length} entries</span><button disabled={result.isDone} onClick={()=>{if(result.continueCursor){setLoaded(items);setCursor(result.continueCursor);}}} className="font-semibold text-brand disabled:opacity-40">{result.isDone?"All events loaded":"Load more"}</button></div></>}</Card></div>;
}
