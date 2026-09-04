import { requireRole } from "@/lib/auth/user";
import { getPrisma } from "@/lib/db/prisma";
import type { MapReport } from "@/features/map/components/community-map";

const labels = { VERIFIED: "Verified", IN_PROGRESS: "In Progress", RESOLVED: "Resolved" } as const;

export async function getCommunityMapReports(): Promise<MapReport[]> {
  await requireRole(["RESIDENT"]);
  const reports = await getPrisma().report.findMany({
    where: {
      status: { in: ["VERIFIED", "IN_PROGRESS", "RESOLVED"] },
      latitude: { not: null },
      longitude: { not: null },
    },
    select: { publicId: true, title: true, status: true, latitude: true, longitude: true, category: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return reports.map((report) => ({ id: report.publicId, title: report.title, category: report.category.name, status: labels[report.status as keyof typeof labels], latitude: report.latitude!, longitude: report.longitude! }));
}
