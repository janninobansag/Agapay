import { ResponseTeamManagement } from "@/features/admin/components/response-team-management";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export const metadata = { title: "Response teams" };
export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  await requireRole(["ADMIN"]);
  const [teams, staff] = await Promise.all([
    getPrisma().responseTeam.findMany({ orderBy: { name: "asc" }, include: { members: { select: { userId: true } }, _count: { select: { reports: true } } } }),
    getPrisma().user.findMany({ where: { role: "STAFF", status: "ACTIVE" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">Response teams</h1><p className="mt-2 max-w-2xl text-muted">Organize active staff into teams that can receive report assignments.</p><div className="mt-8"><ResponseTeamManagement staff={staff} teams={teams.map((team) => ({ id: team.id, name: team.name, contactEmail: team.contactEmail, isActive: team.isActive, memberIds: team.members.map((member) => member.userId), reportCount: team._count.reports }))} /></div></div>;
}
