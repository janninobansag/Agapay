import { ClipboardList, Tags, UsersRound, Wrench } from "lucide-react";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export const metadata = { title: "Administration" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);
  const [users, reports, categories, teams] = await getPrisma().$transaction([
    getPrisma().user.count(),
    getPrisma().report.count(),
    getPrisma().issueCategory.count({ where: { isActive: true } }),
    getPrisma().responseTeam.count({ where: { isActive: true } }),
  ]);
  const cards = [
    { label: "Users", value: users, icon: UsersRound },
    { label: "Reports", value: reports, icon: ClipboardList },
    { label: "Categories", value: categories, icon: Tags },
    { label: "Response teams", value: teams, icon: Wrench },
  ];

  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">System overview</h1><p className="mt-2 text-muted">Manage Agapay’s users, reports, and operational configuration.</p><section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <article className="rounded-2xl border border-border bg-surface p-5" key={label}><span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand"><Icon size={19} /></span><p className="mt-6 text-3xl font-bold text-brand-dark">{value}</p><p className="mt-1 text-sm font-semibold text-muted">{label}</p></article>)}</section></div>;
}

