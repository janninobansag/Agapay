import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export const metadata = { title: "User directory" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);
  const users = await getPrisma().user.findMany({ select: { id: true, name: true, email: true, role: true, status: true }, orderBy: { createdAt: "asc" }, take: 100 });
  return <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">User directory</h1><p className="mt-2 text-muted">A read-only view of account roles and current access status.</p><div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-surface"><table className="w-full min-w-2xl text-left text-sm"><thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wider text-muted"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th></tr></thead><tbody className="divide-y divide-border">{users.map((user) => <tr key={user.id}><td className="p-4"><p className="font-bold text-brand-dark">{user.name}</p><p className="mt-1 text-xs text-muted">{user.email}</p></td><td className="p-4 font-semibold">{user.role}</td><td className="p-4"><span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-dark">{user.status}</span></td></tr>)}</tbody></table></div></div>;
}
