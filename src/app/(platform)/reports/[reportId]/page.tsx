import { ArrowLeft, Check, MapPin, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseState } from "@/components/feedback/database-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { getReportByPublicId } from "@/server/queries/reports";
import { cancelReport } from "@/server/actions/reports";

type ReportDetailsPageProps = {
  params: Promise<{ reportId: string }>;
};

export const dynamic = "force-dynamic";

export default async function ReportDetailsPage({ params }: ReportDetailsPageProps) {
  const { reportId } = await params;
  const { data: report, availability } = await getReportByPublicId(reportId);

  if (!report && availability === "ready") notFound();
  if (!report) return <div className="mx-auto max-w-4xl"><DatabaseState availability={availability} /></div>;

  return (
    <div className="mx-auto max-w-4xl">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-brand" href="/reports"><ArrowLeft size={16} /> Back to reports</Link>
      <div className="mt-6 rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div><p className="font-mono text-xs font-bold text-brand">{report.id} · {report.category}</p><h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.04em] text-brand-dark">{report.title}</h1><p className="mt-3 flex items-center gap-2 text-sm text-muted"><MapPin size={16} /> {report.location}</p></div>
          <StatusBadge status={report.status} />
        </div>
        {(report.canEdit || report.canCancel) && <div className="mt-6 flex flex-wrap gap-3">{report.canEdit && <Link className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-brand-dark" href={`/reports/${report.id}/edit`}><Pencil size={15} /> Edit report</Link>}{report.canCancel && <form action={cancelReport.bind(null, report.id)}><button className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700" type="submit">Cancel report</button></form>}</div>}
        <div className="mt-8 grid gap-8 border-t border-border pt-8 md:grid-cols-[1fr_280px]">
          <section><h2 className="font-bold text-brand-dark">Description</h2><p className="mt-3 leading-7 text-muted">{report.description || "No description added yet."}</p>{report.media.length ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{report.media.map((item) => item.url ? <Image alt={item.altText ?? `Evidence for ${report.id}`} className="h-52 w-full rounded-2xl object-cover" height={520} key={item.id} src={item.url} unoptimized width={800} /> : <div className="grid h-52 place-items-center rounded-2xl bg-surface-muted text-sm text-muted" key={item.id}>Image temporarily unavailable</div>)}</div> : <div className="mt-6 grid min-h-52 place-items-center rounded-2xl bg-surface-muted text-sm font-semibold text-muted">No evidence photo uploaded</div>}</section>
          <section><h2 className="font-bold text-brand-dark">Progress</h2><ol className="mt-5 space-y-5">{report.history.map((event) => <li className="flex gap-3" key={event.id}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-white"><Check size={15} /></span><div><p className="text-sm font-bold">{event.title}</p>{event.note && <p className="mt-1 text-xs leading-5 text-muted">{event.note}</p>}<p className="mt-1 text-xs text-muted">{event.occurredAt}</p></div></li>)}</ol></section>
        </div>
      </div>
    </div>
  );
}
