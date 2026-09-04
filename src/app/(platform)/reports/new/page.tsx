import { DatabaseState } from "@/components/feedback/database-state";
import { ReportForm } from "@/features/reports/components/report-form";
import { createReport } from "@/server/actions/reports";
import { getActiveCategories } from "@/server/queries/categories";

export const metadata = { title: "Report an issue" };
export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const { data: categories, availability } = await getActiveCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <DatabaseState availability={availability} />
      <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">New report</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Tell us what needs attention</h1><p className="mt-2 text-muted">Clear information helps the right team respond sooner.</p></div>
      {availability === "ready" && <ReportForm action={createReport} categories={categories} />}
    </div>
  );
}
