"use client";

import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

type DemoRole = "RESIDENT" | "STAFF" | "ADMIN";

type DemoProductTourProps = { role: DemoRole };

const tours: Record<DemoRole, { title: string; description: string; steps: Array<{ label: string; detail: string; href: string }> }> = {
  RESIDENT: {
    title: "Resident getting started",
    description: "Follow this short path to see how a resident reports and tracks a community concern.",
    steps: [
      { label: "Review your dashboard", detail: "See report totals and unread updates.", href: "/dashboard" },
      { label: "Track AGP-1042", detail: "Open the in-progress streetlight report and its activity history.", href: "/reports/AGP-1042" },
      { label: "Create a report", detail: "Try the guided issue submission flow.", href: "/reports/new" },
    ],
  },
  STAFF: {
    title: "Staff getting started",
    description: "See how the response team verifies, assigns, and resolves community reports.",
    steps: [
      { label: "Review the work queue", detail: "Find submitted and assigned reports.", href: "/staff" },
      { label: "Open AGP-1042", detail: "Inspect the assigned streetlight report and its audit trail.", href: "/staff/reports/AGP-1042" },
      { label: "Complete a resolution", detail: "Add a resolution summary when a repair is finished.", href: "/staff/reports/AGP-1042" },
    ],
  },
  ADMIN: {
    title: "Administrator getting started",
    description: "Explore the operational view of Agapay and its community response data.",
    steps: [
      { label: "Review system totals", detail: "See users, reports, categories, and teams.", href: "/admin" },
      { label: "Manage reports", detail: "Review the complete report register.", href: "/admin/reports" },
      { label: "Manage users", detail: "Review the available resident and staff accounts.", href: "/admin/users" },
    ],
  },
};

export function DemoProductTour({ role }: DemoProductTourProps) {
  const storageKey = `agapay-demo-tour-${role.toLowerCase()}`;
  const [isDismissed, setIsDismissed] = useState(false);
  const tour = tours[role];
  const isStoredAsVisible = useSyncExternalStore(
    () => () => {},
    () => window.localStorage.getItem(storageKey) !== "dismissed",
    () => false,
  );

  function dismiss() {
    window.localStorage.setItem(storageKey, "dismissed");
    setIsDismissed(true);
  }

  if (!isStoredAsVisible || isDismissed) return null;

  return (
    <section aria-labelledby="demo-tour-heading" className="mb-8 rounded-3xl border border-brand/20 bg-brand-soft/55 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Getting started</p>
          <h2 id="demo-tour-heading" className="mt-1 text-xl font-bold text-brand-dark">{tour.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{tour.description}</p>
        </div>
        <button aria-label="Dismiss demo tour" className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-brand-dark" onClick={dismiss} type="button">
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {tour.steps.map((step, index) => (
          <li key={step.label}>
            <Link className="block h-full rounded-2xl border border-border bg-surface p-4 transition hover:border-brand/40 hover:shadow-sm" href={step.href}>
              <div className="flex items-center gap-2 text-sm font-bold text-brand-dark">
                <span className="grid size-6 place-items-center rounded-full bg-brand text-xs text-white">{index + 1}</span>
                {step.label}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">{step.detail}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand">Open <CheckCircle2 aria-hidden="true" size={14} /></span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
