import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReportForm } from "@/features/reports/components/report-form";
import { updateReport } from "@/server/actions/reports";
import { getActiveCategories } from "@/server/queries/categories";
import { getReportByPublicId } from "@/server/queries/reports";

export const metadata = { title: "Edit report" };
export const dynamic = "force-dynamic";

export default async function EditReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const [{ data: report, availability }, { data: categories }] = await Promise.all([getReportByPublicId(reportId), getActiveCategories()]);
  if (!report && availability === "ready") notFound();
  if (!report) redirect("/reports");
  if (!report.canEdit) redirect(`/reports/${reportId}`);
  const action = updateReport.bind(null, reportId);
  return <div className="mx-auto max-w-3xl"><Link className="inline-flex items-center gap-2 text-sm font-bold text-brand" href={`/reports/${reportId}`}><ArrowLeft size={16} /> Back to report</Link><h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Edit {reportId}</h1><p className="mt-2 text-muted">Drafts and reports awaiting verification can still be updated.</p><ReportForm action={action} categories={categories} initial={{ categoryId: report.categoryId, title: report.title, description: report.description, address: report.location, latitude: report.latitude, longitude: report.longitude }} /></div>;
}
