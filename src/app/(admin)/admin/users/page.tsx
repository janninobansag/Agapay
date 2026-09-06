import { AdminUserManagement } from "@/features/admin/components/admin-user-management";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export const metadata = { title: "User management" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireRole(["ADMIN"]);
  const users = await getPrisma().user.findMany({
    select: { id: true, name: true, email: true, username: true, role: true, status: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Administration</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-brand-dark">User management</h1>
      <p className="mt-2 max-w-2xl text-muted">Create staff accounts, deactivate access without deleting history, reactivate users, and reset passwords.</p>
      <div className="mt-8"><AdminUserManagement currentUserId={admin.id} users={users} /></div>
    </div>
  );
}
