import { Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import { DatabaseState } from "@/components/feedback/database-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { getResidentReports } from "@/server/queries/reports";

export const metadata = { title: "My reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { data: reports, availability } = await getResidentReports();

  return (
    <div>
      <DatabaseState availability={availability} />
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Reports</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">My community reports</h1><p className="mt-2 text-muted">Track every report from submission to resolution.</p></div>
        <Link className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark" href="/reports/new"><Plus size={17} /> New report</Link>
      </div>
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl bg-surface-muted px-3"><Search className="text-muted" size={18} /><span className="sr-only">Search reports</span><input className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted" placeholder="Search by title, ID, or location" type="search" /></label>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-brand-dark hover:bg-surface-muted"><Filter size={17} /> Filter</button>
      </div>
      <div className="mt-5 grid gap-4">
        {reports.map((report) => (
          <Link className="grid gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-sm sm:grid-cols-[1fr_auto] sm:items-center" href={`/reports/${report.id}`} key={report.id}>
            <div><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-brand">{report.id}</span><span className="text-xs text-muted">{report.category}</span></div><h2 className="mt-2 font-bold text-brand-dark">{report.title}</h2><p className="mt-1 text-sm text-muted">{report.location} · Submitted {report.submittedAt}</p></div>
            <StatusBadge status={report.status} />
          </Link>
        ))}
        {reports.length === 0 && availability === "ready" && (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="font-bold text-brand-dark">You have not submitted a report yet</p>
            <p className="mt-2 text-sm text-muted">Your submitted reports will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
