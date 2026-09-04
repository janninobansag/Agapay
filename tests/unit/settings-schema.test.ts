import { describe, expect, it } from "vitest";
import { notificationSettingsSchema, profileSettingsSchema } from "@/features/settings/schemas";

describe("account settings schemas", () => {
  it("trims and accepts a valid display name", () => {
    expect(profileSettingsSchema.parse({ name: "  Juan Dela Cruz  " }).name).toBe("Juan Dela Cruz");
  });

  it("rejects an empty display name", () => {
    expect(profileSettingsSchema.safeParse({ name: " " }).success).toBe(false);
  });

  it("requires a real boolean notification preference", () => {
    expect(notificationSettingsSchema.safeParse({ inAppNotificationsEnabled: true }).success).toBe(true);
    expect(notificationSettingsSchema.safeParse({ inAppNotificationsEnabled: "true" }).success).toBe(false);
  });
});
