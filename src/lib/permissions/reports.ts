import type { UserRole } from "@prisma/client";

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

