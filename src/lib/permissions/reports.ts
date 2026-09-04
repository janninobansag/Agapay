import type { UserRole } from "@prisma/client";
import type { ReportStatus } from "@prisma/client";

type ReportViewer = {
  id: string;
  role: UserRole;
};

export function canViewReport(viewer: ReportViewer, reporterId: string) {
  return viewer.role === "ADMIN" || viewer.role === "STAFF" || viewer.id === reporterId;
}

export function canReviewReports(role: UserRole) {
  return role === "ADMIN" || role === "STAFF";
}

export function canManageUsers(role: UserRole) {
  return role === "ADMIN";
}

export function canEditReport(status: ReportStatus) {
  return status === "DRAFT" || status === "SUBMITTED";
}

export function canCancelReport(status: ReportStatus) {
  return status === "DRAFT" || status === "SUBMITTED" || status === "VERIFIED";
}

const staffTransitions: Record<string, Partial<Record<ReportStatus, ReportStatus>>> = {
  verify: { SUBMITTED: "VERIFIED" },
  reject: { SUBMITTED: "REJECTED", VERIFIED: "REJECTED" },
  assign: { VERIFIED: "VERIFIED" },
  start: { VERIFIED: "IN_PROGRESS" },
  resolve: { IN_PROGRESS: "RESOLVED" },
};

export function getStaffTransition(status: ReportStatus, transition: string) {
  return staffTransitions[transition]?.[status] ?? null;
}
