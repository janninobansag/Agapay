"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export async function markNotificationRead(notificationId: string) {
  const user = await requireRole(["RESIDENT"]);
  await getPrisma().notification.updateMany({
    where: { id: notificationId, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  const user = await requireRole(["RESIDENT"]);
  await getPrisma().notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
