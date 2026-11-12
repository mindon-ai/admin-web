"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { dateTime, number, percent } from "@/lib/format";
import { useSession } from "@/lib/session";

export default function DashboardPage() {
  const { token, user } = useSession();
  const from = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const stats = useQuery(api.stats.overview, token ? { token, from } : "skip");
  const latest = useQuery(api.inspections.latest, token ? { token, limit: 8 } : "skip");
  const value = stats;
  const cards = [
    ["Parts inspected today", value ? number(value.totalInspected) : "—"],
    ["Defects recorded", value ? number(value.totalDefects) : "—"],
    ["Defect rate", value ? percent(value.defectRate) : "—"],
    ["Active operators", value ? number(value.activeOperators) : "—"],
  ];
  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted">Welcome back, {user?.displayName}</p><h1 className="mt-1 text-2xl font-bold">Operations overview</h1></div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Live data</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, stat]) => <Card key={label}><p className="text-sm text-muted">{label}</p><p className="mt-3 text-3xl font-bold">{stats === undefined ? <span className="text-xl text-muted">Loading…</span> : stat}</p></Card>)}</div>
    <Card className="mt-6 overflow-hidden !p-0"><div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-bold">Latest submissions</h2><p className="mt-1 text-xs text-muted">New inspections appear automatically</p></div><Link href="/submissions" className="text-sm font-semibold text-brand">View all →</Link></div>
      {latest === undefined ? <p className="p-6 text-sm text-muted">Loading submissions…</p> : latest.length === 0 ? <div className="p-8 text-center"><p className="font-semibold">No submissions yet</p><p className="mt-1 text-sm text-muted">Submissions from operators will appear here.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr>{["Received", "Operator", "Mission order", "Part serial", "Qty", "Defects", "Status"].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{latest.map(row => <tr key={row._id} className="border-t border-line hover:bg-canvas/70"><td className="whitespace-nowrap px-4 py-3">{dateTime(row.receivedAt)}</td><td className="px-4 py-3">{row.userName}</td><td className="px-4 py-3 font-medium">{row.moNumber}</td><td className="px-4 py-3">{row.partSerial}</td><td className="px-4 py-3">{number(row.quantity)}</td><td className="px-4 py-3">{number(row.totalDefects)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.status === "valid" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{row.status === "valid" ? "Valid" : "Voided"}</span></td></tr>)}</tbody></table></div>}
    </Card>
  </div>;
}
