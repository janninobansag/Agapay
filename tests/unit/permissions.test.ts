import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import {
  canManageUsers,
  canReviewReports,
  canViewReport,
} from "@/lib/permissions/reports";

describe("report authorization", () => {
  it("allows residents to view their own reports", () => {
    expect(
      canViewReport({ id: "resident-a", role: UserRole.RESIDENT }, "resident-a"),
    ).toBe(true);
  });

  it("prevents residents from viewing another resident's report", () => {
    expect(
      canViewReport({ id: "resident-a", role: UserRole.RESIDENT }, "resident-b"),
    ).toBe(false);
  });

  it("allows staff and administrators to review reports", () => {
    expect(canReviewReports(UserRole.STAFF)).toBe(true);
    expect(canReviewReports(UserRole.ADMIN)).toBe(true);
    expect(canReviewReports(UserRole.RESIDENT)).toBe(false);
  });

  it("reserves user management for administrators", () => {
    expect(canManageUsers(UserRole.ADMIN)).toBe(true);
    expect(canManageUsers(UserRole.STAFF)).toBe(false);
    expect(canManageUsers(UserRole.RESIDENT)).toBe(false);
  });
});

