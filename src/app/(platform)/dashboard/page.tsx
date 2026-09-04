import { ArrowUpRight, CheckCircle2, Clock3, FileText, Plus, UsersRound } from "lucide-react";
import Link from "next/link";
import { DatabaseState } from "@/components/feedback/database-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/user";
import { getResidentReports } from "@/server/queries/reports";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const { data: reports, availability } = await getResidentReports();
  const activeCount = reports.filter((report) => !["Draft", "Resolved", "Rejected", "Cancelled"].includes(report.status)).length;
  const resolvedCount = reports.filter((report) => report.status === "Resolved").length;
  const stats = [
    { label: "My reports", value: String(reports.length), detail: `${activeCount} active`, icon: FileText },
    { label: "Active reports", value: String(activeCount), detail: "Awaiting resolution", icon: Clock3 },
    { label: "Resolved", value: String(resolvedCount), detail: "From your reports", icon: CheckCircle2 },
    { label: "Service area", value: "Demo", detail: "Barangay Demo", icon: UsersRound },
  ];

  return (
    <div>
      <DatabaseState availability={availability} />
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Resident dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark sm:text-4xl">Good morning, {user.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-muted">Here is what is happening in your community.</p>
        </div>
        <Link className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark" href="/reports/new">
          <Plus size={17} /> Create report
        </Link>
      </div>

      <section aria-label="Community statistics" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <article className="rounded-2xl border border-border bg-surface p-5" key={label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">{label}</p>
              <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand"><Icon aria-hidden="true" size={18} /></span>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-brand-dark">{value}</p>
            <p className="mt-1 text-xs font-medium text-muted">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
          <div><h2 className="text-lg font-bold text-brand-dark">Recent reports</h2><p className="mt-1 text-sm text-muted">Latest activity from your submissions</p></div>
          <Link className="flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-dark" href="/reports">View all <ArrowUpRight size={16} /></Link>
        </div>
        <div className="divide-y divide-border">
          {reports.map((report) => (
            <Link className="grid gap-3 px-5 py-5 transition hover:bg-surface-muted/60 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6" href={`/reports/${report.id}`} key={report.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-brand">{report.id}</span><span className="text-xs text-muted">{report.category}</span></div>
                <h3 className="mt-1 truncate font-bold text-brand-dark">{report.title}</h3>
                <p className="mt-1 text-sm text-muted">{report.location} · {report.submittedAt}</p>
              </div>
              <StatusBadge status={report.status} />
            </Link>
          ))}
          {reports.length === 0 && (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="font-bold text-brand-dark">No reports to show</p>
              <p className="mt-2 text-sm text-muted">Seed the database or create your first community report.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
