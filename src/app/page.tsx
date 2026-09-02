import { ArrowRight, CheckCircle2, ClipboardCheck, MapPin, MessageSquareText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";

const steps = [
  { number: "01", title: "Share what you see", description: "Add a clear description, location, and photo of the community issue." },
  { number: "02", title: "Local teams respond", description: "Authorized staff verify the report and coordinate the right response." },
  { number: "03", title: "Follow the resolution", description: "Receive transparent updates until the issue is marked as resolved." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <SiteHeader />
      <main>
        <section className="landing-grid relative border-b border-border">
          <div className="absolute -right-28 top-12 size-96 rounded-full bg-brand-soft/70 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
                <ShieldCheck aria-hidden="true" size={15} /> Community-powered action
              </span>
              <h1 className="mt-7 text-5xl font-bold leading-[1.04] tracking-[-0.055em] text-brand-dark sm:text-6xl lg:text-7xl">
                See a problem.<br />Start the solution.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Agapay connects residents and local response teams through clear reports, timely updates, and visible results.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 font-bold text-white shadow-[0_12px_30px_rgb(25_118_91_/_0.22)] transition hover:-translate-y-0.5 hover:bg-brand-dark" href="/reports/new">
                  Report an issue <ArrowRight aria-hidden="true" size={18} />
                </Link>
                <Link className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-6 py-3.5 font-bold text-brand-dark transition hover:border-brand/30 hover:bg-brand-soft" href="/dashboard">
                  Explore the demo
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-muted">
                <span className="flex items-center gap-2"><CheckCircle2 className="text-brand" size={17} /> Free for residents</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="text-brand" size={17} /> Transparent status tracking</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-md rotate-1 rounded-[2rem] border border-border bg-surface p-5 shadow-[0_30px_80px_rgb(13_75_59_/_0.14)]">
                <div className="rounded-[1.4rem] bg-brand-dark p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/65">Active report</p>
                      <p className="mt-1 font-mono text-xs font-semibold tracking-wider text-white/80">AGP-1042</p>
                    </div>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-brand-dark">In progress</span>
                  </div>
                  <h2 className="mt-10 text-2xl font-bold tracking-tight">Streetlight not working near the covered court</h2>
                  <p className="mt-3 flex items-center gap-2 text-sm text-white/70"><MapPin size={16} /> Mabini Street</p>
                </div>
                <div className="space-y-5 px-2 py-6">
                  {["Report received", "Location verified", "Assigned to maintenance"].map((item, index) => (
                    <div className="flex gap-3" key={item}>
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{index + 1}</span>
                      <div><p className="text-sm font-bold">{item}</p><p className="mt-0.5 text-xs text-muted">Update shared with the resident</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8" id="how-it-works">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Simple by design</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-brand-dark sm:text-4xl">From concern to community action</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <article className="rounded-3xl border border-border bg-surface p-7" key={step.number}>
                <span className="font-mono text-sm font-bold text-brand">{step.number}</span>
                <h3 className="mt-12 text-xl font-bold text-brand-dark">{step.title}</h3>
                <p className="mt-3 leading-7 text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-brand-dark text-white" id="features">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-300">Built for trust</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">Everyone sees what happens next.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [MapPin, "Location-aware", "Place reports exactly where teams need to respond."],
                [ClipboardCheck, "Accountable", "Every status change builds a transparent history."],
                [MessageSquareText, "Connected", "Residents receive updates without chasing offices."],
                [ShieldCheck, "Moderated", "Verification tools keep community information useful."],
              ].map(([Icon, title, description]) => {
                const FeatureIcon = Icon as typeof MapPin;
                return (
                  <article className="rounded-2xl border border-white/10 bg-white/5 p-5" key={title as string}>
                    <FeatureIcon aria-hidden="true" className="text-emerald-300" size={23} />
                    <h3 className="mt-5 font-bold">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{description as string}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="font-semibold text-brand-dark">Agapay — communities that respond.</p>
          <p>Portfolio demonstration · 2026</p>
        </div>
      </footer>
    </div>
  );
}

