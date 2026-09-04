import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import {
  canManageUsers,
  canReviewReports,
  canViewReport,
  canCancelReport,
  canEditReport,
  getStaffTransition,
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

  it("limits resident changes to pre-work states", () => {
    expect(canEditReport("DRAFT")).toBe(true);
    expect(canEditReport("SUBMITTED")).toBe(true);
    expect(canEditReport("VERIFIED")).toBe(false);
    expect(canCancelReport("VERIFIED")).toBe(true);
    expect(canCancelReport("IN_PROGRESS")).toBe(false);
  });

  it("enforces the staff lifecycle", () => {
    expect(getStaffTransition("SUBMITTED", "verify")).toBe("VERIFIED");
    expect(getStaffTransition("VERIFIED", "start")).toBe("IN_PROGRESS");
    expect(getStaffTransition("IN_PROGRESS", "resolve")).toBe("RESOLVED");
    expect(getStaffTransition("RESOLVED", "start")).toBeNull();
  });
});
