import { PlatformShell } from "@/components/layout/platform-shell";
import { requireRole } from "@/lib/auth/user";
import { getUnreadNotificationCount } from "@/server/queries/notifications";

export default async function ResidentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole(["RESIDENT"]);
  const unreadCount = await getUnreadNotificationCount(user.id);
  return <PlatformShell unreadCount={unreadCount} user={user}>{children}</PlatformShell>;
}
