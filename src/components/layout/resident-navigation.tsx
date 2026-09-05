"use client";

import { Bell, FileText, LayoutDashboard, Map, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/reports", label: "My reports", icon: FileText },
  { href: "/map", label: "Community map", icon: Map },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function ResidentNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const links = mobile ? navigation.slice(0, 4) : navigation;
  return <nav aria-label={mobile ? "Mobile navigation" : "Resident navigation"} className={mobile ? "fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-surface px-2 py-2 lg:hidden" : "flex-1 space-y-1 p-4"}>{links.map(({ href, label, icon: Icon }) => {
    const active = isActive(pathname, href);
    return <Link aria-current={active ? "page" : undefined} className={mobile ? `flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${active ? "text-brand" : "text-muted"}` : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-brand-soft text-brand-dark" : "text-muted hover:bg-surface-muted hover:text-foreground"}`} href={href} key={href}><Icon aria-hidden="true" size={mobile ? 20 : 19} />{mobile ? label.replace("Community ", "") : label}</Link>;
  })}</nav>;
}
