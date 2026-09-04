import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export async function getResidentNotifications() {
  const user = await requireRole(["RESIDENT"]);
  return getPrisma().notification.findMany({
    where: { userId: user.id },
    include: { report: { select: { publicId: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return getPrisma().notification.count({ where: { userId, readAt: null } });
}
