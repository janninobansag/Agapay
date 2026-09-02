import type { ReportStatus } from "@/features/reports/types";

const styles: Record<ReportStatus, string> = {
  Draft: "bg-slate-50 text-slate-700 ring-slate-200",
  Submitted: "bg-sky-50 text-sky-700 ring-sky-200",
  Verified: "bg-violet-50 text-violet-700 ring-violet-200",
  "In Progress": "bg-amber-50 text-amber-800 ring-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
}
