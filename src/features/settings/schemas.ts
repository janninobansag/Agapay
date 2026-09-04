import { z } from "zod";

export const profileSettingsSchema = z.object({
  name: z.string().trim().min(2, "Use at least 2 characters.").max(100, "Use 100 characters or fewer."),
});

export const notificationSettingsSchema = z.object({
  inAppNotificationsEnabled: z.boolean(),
});
