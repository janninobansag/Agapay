"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function RoleNavigation({ areaLabel, links }: { areaLabel: string; links: Array<{ href: string; label: string }> }) {
  const pathname = usePathname();
  return <nav aria-label={`${areaLabel} navigation`} className="flex items-center gap-1">{links.map((link) => {
    const moreSpecificMatch = links.some((other) => other.href.length > link.href.length && (pathname === other.href || pathname.startsWith(`${other.href}/`)));
    const active = pathname === link.href || (pathname.startsWith(`${link.href}/`) && !moreSpecificMatch);
    return <Link aria-current={active ? "page" : undefined} className={`rounded-full px-3 py-2 text-sm font-bold ${active ? "bg-brand-soft text-brand-dark" : "text-muted hover:bg-surface-muted hover:text-brand-dark"}`} href={link.href} key={link.href}>{link.label}</Link>;
  })}</nav>;
}
