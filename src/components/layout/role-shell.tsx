import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import type { CurrentUser } from "@/lib/auth/user";
import { RoleNavigation } from "@/components/layout/role-navigation";

type RoleShellProps = {
  children: React.ReactNode;
  user: CurrentUser;
  areaLabel: string;
  links: Array<{ href: string; label: string }>;
};

export function RoleShell({ children, user, areaLabel, links }: RoleShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <div className="flex items-center gap-4">
            <Link aria-label="Agapay home" href="/"><BrandMark /></Link>
            <span className="hidden h-6 w-px bg-border sm:block" />
            <span className="hidden items-center gap-2 text-sm font-bold text-muted sm:flex"><ShieldCheck size={17} /> {areaLabel}</span>
          </div>
          <RoleNavigation areaLabel={areaLabel} links={links} />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold text-brand-dark">{user.name}</p><p className="text-xs text-muted">{user.role.toLowerCase()}</p></div>
            <div className="w-24"><SignOutButton /></div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">{children}</main>
    </div>
  );
}
