import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth/user";

export default async function StaffLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole(["STAFF", "ADMIN"]);
  return <RoleShell areaLabel="Response workspace" links={[{ href: "/staff", label: "Work queue" }]} user={user}>{children}</RoleShell>;
}

