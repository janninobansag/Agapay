import {
  Bell,
  CircleUserRound,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import type { CurrentUser } from "@/lib/auth/user";
import { ResidentNavigation } from "@/components/layout/resident-navigation";

export function PlatformShell({ children, unreadCount, user }: Readonly<{ children: React.ReactNode; unreadCount: number; user: CurrentUser }>) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-border px-6">
          <Link aria-label="Agapay home" href="/"><BrandMark /></Link>
        </div>
        <ResidentNavigation />
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
            <CircleUserRound aria-hidden="true" className="text-brand" size={32} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <div className="mt-2"><SignOutButton /></div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur lg:px-8">
          <Link aria-label="Agapay home" className="lg:hidden" href="/"><BrandMark /></Link>
          <p className="hidden text-sm font-medium text-muted lg:block">A safer neighborhood starts with one report.</p>
          <div className="flex items-center gap-2">
            <Link aria-label={`${unreadCount} unread notifications`} className="relative grid size-10 place-items-center rounded-full border border-border bg-surface text-muted hover:text-brand" href="/notifications">
              <Bell aria-hidden="true" size={19} />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-brand-dark">{Math.min(unreadCount, 99)}</span>}
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark" href="/reports/new">
              <Plus aria-hidden="true" size={17} />
              <span className="hidden sm:inline">New report</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-5 pb-24 lg:p-8">{children}</main>
        <ResidentNavigation mobile />
      </div>
    </div>
  );
}
