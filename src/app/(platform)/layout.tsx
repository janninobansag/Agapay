import { PlatformShell } from "@/components/layout/platform-shell";
import { requireRole } from "@/lib/auth/user";

export default async function ResidentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole(["RESIDENT"]);
  return <PlatformShell user={user}>{children}</PlatformShell>;
}
