import {
  Bell,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  Map,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/reports", label: "My reports", icon: FileText },
  { href: "/map", label: "Community map", icon: Map },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function PlatformShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-border px-6">
          <Link aria-label="Agapay home" href="/"><BrandMark /></Link>
        </div>
        <nav aria-label="Resident navigation" className="flex-1 space-y-1 p-4">
          {navigation.map(({ href, label, icon: Icon }, index) => (
            <Link
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${index === 0 ? "bg-brand-soft text-brand-dark" : "text-muted hover:bg-surface-muted hover:text-foreground"}`}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
            <CircleUserRound aria-hidden="true" className="text-brand" size={32} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Demo resident</p>
              <p className="truncate text-xs text-muted">resident@agapay.local</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur lg:px-8">
          <Link aria-label="Agapay home" className="lg:hidden" href="/"><BrandMark /></Link>
          <p className="hidden text-sm font-medium text-muted lg:block">A safer neighborhood starts with one report.</p>
          <div className="flex items-center gap-2">
            <button aria-label="View notifications" className="grid size-10 place-items-center rounded-full border border-border bg-surface text-muted hover:text-brand">
              <Bell aria-hidden="true" size={19} />
            </button>
            <Link className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark" href="/reports/new">
              <Plus aria-hidden="true" size={17} />
              <span className="hidden sm:inline">New report</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-5 pb-24 lg:p-8">{children}</main>
        <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-surface px-2 py-2 lg:hidden">
          {navigation.slice(0, 4).map(({ href, label, icon: Icon }, index) => (
            <Link className={`flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${index === 0 ? "text-brand" : "text-muted"}`} href={href} key={href}>
              <Icon aria-hidden="true" size={20} />
              {label.replace("Community ", "")}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

