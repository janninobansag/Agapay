import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export const metadata = { title: "Manage reports" };
export const dynamic = "force-dynamic";

const labels = { DRAFT: "Draft", SUBMITTED: "Submitted", VERIFIED: "Verified", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", REJECTED: "Rejected", CANCELLED: "Cancelled" } as const;

export default async function AdminReportsPage() {
  await requireRole(["ADMIN"]);
  const reports = await getPrisma().report.findMany({ include: { category: { select: { name: true } }, reporter: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 });
  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">All reports</h1><div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface"><div className="divide-y divide-border">{reports.map((report) => <article className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center" key={report.id}><div><p className="font-mono text-xs font-bold text-brand">{report.publicId} · {report.category.name}</p><h2 className="mt-1 font-bold text-brand-dark">{report.title}</h2><p className="mt-1 text-sm text-muted">Reported by {report.reporter.name}</p></div><StatusBadge status={labels[report.status]} /></article>)}</div></div></div>;
}
