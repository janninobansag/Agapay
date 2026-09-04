import type { ReportStatus as DatabaseReportStatus } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/user";
import type { ReportStatus, ReportSummary } from "@/features/reports/types";
import { canCancelReport, canEditReport } from "@/lib/permissions/reports";
import { getEvidenceUrl } from "@/lib/storage/evidence";

export type DataAvailability = "ready" | "unconfigured" | "unavailable";

export type QueryResult<T> = {
  data: T;
  availability: DataAvailability;
};

export type ReportDetails = ReportSummary & {
  categoryId: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  canEdit: boolean;
  canCancel: boolean;
  media: Array<{ id: string; url: string | null; altText: string | null }>;
  history: Array<{
    id: string;
    title: string;
    note: string | null;
    occurredAt: string;
  }>;
};

function toDisplayStatus(status: DatabaseReportStatus): ReportStatus {
  const labels: Record<DatabaseReportStatus, ReportStatus> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    VERIFIED: "Verified",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

  return labels[status];
}

function formatDate(value: Date | null) {
  if (!value) return "Not submitted";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(value);
}

function statusEventTitle(status: DatabaseReportStatus) {
  const titles: Record<DatabaseReportStatus, string> = {
    DRAFT: "Draft saved",
    SUBMITTED: "Report submitted",
    VERIFIED: "Location and details verified",
    IN_PROGRESS: "Response work started",
    RESOLVED: "Report resolved",
    REJECTED: "Report rejected",
    CANCELLED: "Report cancelled",
  };

  return titles[status];
}

export async function getResidentReports(): Promise<QueryResult<ReportSummary[]>> {
  if (!isDatabaseConfigured()) return { data: [], availability: "unconfigured" };
  const user = await requireRole(["RESIDENT"]);

  try {
    const reports = await getPrisma().report.findMany({
      where: { reporterId: user.id },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return {
      availability: "ready",
      data: reports.map((report) => ({
        id: report.publicId,
        title: report.title,
        category: report.category.name,
        location: report.address,
        submittedAt: formatDate(report.submittedAt ?? report.createdAt),
        status: toDisplayStatus(report.status),
      })),
    };
  } catch (error) {
    console.error("Unable to load resident reports", error);
    return { data: [], availability: "unavailable" };
  }
}

export async function getReportByPublicId(publicId: string): Promise<QueryResult<ReportDetails | null>> {
  if (!isDatabaseConfigured()) return { data: null, availability: "unconfigured" };
  const user = await requireRole(["RESIDENT"]);

  try {
    const report = await getPrisma().report.findFirst({
      where: { publicId, reporterId: user.id },
      include: {
        category: { select: { name: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
        media: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!report) return { data: null, availability: "ready" };

    const media = await Promise.all(report.media.map(async (item) => ({ id: item.id, altText: item.altText, url: await getEvidenceUrl(item.objectKey) })));
    return {
      availability: "ready",
      data: {
        id: report.publicId,
        title: report.title,
        category: report.category.name,
        categoryId: report.categoryId,
        location: report.address,
        submittedAt: formatDate(report.submittedAt ?? report.createdAt),
        status: toDisplayStatus(report.status),
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
        canEdit: canEditReport(report.status),
        canCancel: canCancelReport(report.status),
        media,
        history: report.statusHistory.map((event) => ({
          id: event.id,
          title: statusEventTitle(event.toStatus),
          note: event.note,
          occurredAt: formatDate(event.createdAt),
        })),
      },
    };
  } catch (error) {
    console.error(`Unable to load report ${publicId}`, error);
    return { data: null, availability: "unavailable" };
  }
}
