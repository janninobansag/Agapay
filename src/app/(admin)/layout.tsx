import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth/user";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole(["ADMIN"]);
  return <RoleShell areaLabel="Administration" links={links} user={user}>{children}</RoleShell>;
}

