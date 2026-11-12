"use client";

import { use } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { useSession } from "@/lib/session";

export default function UserDetailPage({params}:{params:Promise<{id:string}>}) {
  const {id}=use(params); const {token}=useSession(); const userId=id as Id<"users">;
  const user=useQuery(api.users.get,token?{token,userId}:"skip");
  const sessions=useQuery(api.users.getSessions,token?{token,userId}:"skip");
  const performance=useQuery(api.stats.userDetail,token?{token,userId}:"skip");
  const submissions=useQuery(api.inspections.search,token?{token,userId,paginationOpts:{numItems:10,cursor:null}}:"skip");
  if(user===undefined)return <p className="p-10 text-sm text-muted">Loading user…</p>;
  if(!user)return <div><Link href="/users" className="text-sm text-brand">← Users</Link><p className="mt-6">User not found.</p></div>;
  return <div><Link href="/users" className="text-sm font-medium text-brand">← Users</Link><div className="mb-6 mt-4"><p className="text-sm text-muted">User profile</p><h1 className="mt-1 text-2xl font-bold">{user.displayName}</h1><p className="mt-1 font-mono text-sm text-muted">{user.userNumber} · <span className="capitalize">{user.role}</span> · {user.isActive?"Active":"Inactive"}</p></div>
    <div className="grid gap-5 xl:grid-cols-2"><Card><h2 className="font-bold">Performance snapshot</h2>{performance===undefined?<p className="mt-4 text-sm text-muted">Loading…</p>:!performance?<p className="mt-4 text-sm text-muted">No performance data.</p>:<div className="mt-4 grid grid-cols-2 gap-4 text-sm"><Stat label="Parts inspected" value={performance.stats.totalInspected}/><Stat label="Defects" value={performance.stats.totalDefects}/><Stat label="Defect rate" value={`${(performance.stats.defectRate*100).toFixed(2)}%`}/><Stat label="Submissions" value={performance.stats.validSubmissions}/><Stat label="Submissions/hour" value={performance.stats.submissionsPerHour.toFixed(1)}/><Stat label="Active time (approx.)" value={`${performance.stats.activeHours.toFixed(1)} h`}/></div>}</Card>
    <Card><h2 className="font-bold">Sessions and devices</h2>{sessions===undefined?<p className="mt-4 text-sm text-muted">Loading…</p>:sessions.length===0?<p className="mt-4 text-sm text-muted">No sessions recorded.</p>:<div className="mt-3 divide-y divide-line">{sessions.map(s=><div key={s._id} className="py-3"><div className="flex justify-between text-sm font-medium"><span className="capitalize">{s.clientType} · {s.deviceLabel||"Unknown device"}</span><span className={s.isRevoked||s.isExpired?"text-muted":"text-green-700"}>{s.isRevoked?"Revoked":s.isExpired?"Expired":"Active"}</span></div><p className="mt-1 text-xs text-muted">Created {dateTime(s.createdAt)} · Last used {dateTime(s.lastUsedAt)}{s.appVersion?` · v${s.appVersion}`:""}</p></div>)}</div>}</Card></div>
    <Card className="mt-5 !p-0"><div className="border-b border-line p-5"><h2 className="font-bold">Recent submissions</h2></div>{submissions===undefined?<p className="p-5 text-sm text-muted">Loading…</p>:submissions.page.length===0?<p className="p-5 text-sm text-muted">No submissions yet.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr>{["Received","MO","Part serial","Box","Quantity","Defects","Status"].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{submissions.page.map(row=><tr key={row._id} className="border-t border-line"><td className="p-3">{dateTime(row.receivedAt)}</td><td className="p-3">{row.moNumber}</td><td className="p-3">{row.partSerial}</td><td className="p-3">{row.boxId}</td><td className="p-3">{row.quantity}</td><td className="p-3">{row.totalDefects}</td><td className="p-3 capitalize">{row.status}</td></tr>)}</tbody></table></div>}</Card>
    {performance && performance.moBreakdown && performance.moBreakdown.length>0 && <Card className="mt-5"><h2 className="font-bold">Mission order breakdown</h2><div className="mt-3 divide-y divide-line">{performance.moBreakdown.map(m=><div key={m.moId} className="flex justify-between py-2 text-sm"><span>{m.moNumber}</span><span>{m.submissions} submissions · {m.quantity} parts · {m.defects} defects</span></div>)}</div></Card>}</div>;
}
function Stat({label,value}:{label:string;value:string|number}){return <div className="rounded-lg bg-canvas p-3"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>}
