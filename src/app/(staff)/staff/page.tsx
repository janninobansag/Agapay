import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export const metadata = { title: "Staff workspace" };
export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const user = await requireRole(["STAFF", "ADMIN"]);
  const reports = await getPrisma().report.findMany({ where: { OR: [{ assignedStaffId: user.id }, { assignedTeam: { members: { some: { userId: user.id } } } }] }, include: { category: { select: { name: true } } }, orderBy: { updatedAt: "desc" } });
  const labels = { DRAFT: "Draft", SUBMITTED: "Submitted", VERIFIED: "Verified", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", REJECTED: "Rejected" } as const;
  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Response workspace</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Assigned work</h1><p className="mt-2 text-muted">Reports assigned directly to you or one of your teams.</p><div className="mt-8 grid gap-4">{reports.map((report) => <article className="grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-center" key={report.id}><div><p className="font-mono text-xs font-bold text-brand">{report.publicId} · {report.category.name}</p><h2 className="mt-1 font-bold text-brand-dark">{report.title}</h2><p className="mt-1 text-sm text-muted">{report.address}</p></div><StatusBadge status={labels[report.status]} /></article>)}{reports.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">No reports are assigned to this staff account.</div>}</div></div>;
}

