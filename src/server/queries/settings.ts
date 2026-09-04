import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export async function getResidentSettings() {
  const user = await requireRole(["RESIDENT"]);
  return getPrisma().user.findUniqueOrThrow({
    where: { id: user.id },
    select: { email: true, name: true, inAppNotificationsEnabled: true },
  });
}
