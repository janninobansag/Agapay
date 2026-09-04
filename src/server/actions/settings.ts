"use server";

import { revalidatePath } from "next/cache";
import { notificationSettingsSchema, profileSettingsSchema } from "@/features/settings/schemas";
import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";

export type SettingsState = { success?: boolean; message?: string; errors?: Record<string, string[]> };

export async function updateProfileSettings(
  _previousState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireRole(["RESIDENT"]);
  const parsed = profileSettingsSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await getPrisma().$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
    await tx.auditLog.create({ data: { action: "PROFILE_UPDATED", entityType: "User", entityId: user.id, actorId: user.id, metadata: { changedFields: ["name"] } } });
  });
  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: true, message: "Profile saved." };
}

export async function updateNotificationSettings(
  _previousState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireRole(["RESIDENT"]);
  const parsed = notificationSettingsSchema.parse({
    inAppNotificationsEnabled: formData.get("inAppNotificationsEnabled") === "on",
  });
  await getPrisma().$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: parsed });
    await tx.auditLog.create({ data: { action: "NOTIFICATION_PREFERENCES_UPDATED", entityType: "User", entityId: user.id, actorId: user.id, metadata: parsed } });
  });
  revalidatePath("/settings");
  return { success: true, message: "Notification preference saved." };
}
