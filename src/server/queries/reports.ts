import type { ReportStatus as DatabaseReportStatus } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import type { ReportStatus, ReportSummary } from "@/features/reports/types";

const demoResidentEmail = "resident@agapay.local";

export type DataAvailability = "ready" | "unconfigured" | "unavailable";

export type QueryResult<T> = {
  data: T;
  availability: DataAvailability;
};

export type ReportDetails = ReportSummary & {
  description: string;
  latitude: number | null;
  longitude: number | null;
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
  };

  return titles[status];
}

export async function getResidentReports(): Promise<QueryResult<ReportSummary[]>> {
  if (!isDatabaseConfigured()) return { data: [], availability: "unconfigured" };

  try {
    const reports = await getPrisma().report.findMany({
      where: { reporter: { email: demoResidentEmail } },
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

  try {
    const report = await getPrisma().report.findUnique({
      where: { publicId },
      include: {
        category: { select: { name: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!report) return { data: null, availability: "ready" };

    return {
      availability: "ready",
      data: {
        id: report.publicId,
        title: report.title,
        category: report.category.name,
        location: report.address,
        submittedAt: formatDate(report.submittedAt ?? report.createdAt),
        status: toDisplayStatus(report.status),
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
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

