import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { NotificationType, PrismaClient, ReportStatus, UserRole } from "@prisma/client";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const prisma = testDatabaseUrl ? new PrismaClient({ adapter: new PrismaPg({ connectionString: testDatabaseUrl }) }) : null;
const suffix = randomUUID();
const email = `integration-${suffix}@agapay.test`;
const categorySlug = `integration-${suffix}`;
let reportId = "";
let userId = "";
let categoryId = "";

describe.skipIf(!prisma)("report lifecycle integration", () => {
  beforeAll(async () => {
    const user = await prisma!.user.create({ data: { email, name: "Integration Resident", role: UserRole.RESIDENT } });
    const category = await prisma!.issueCategory.create({ data: { slug: categorySlug, name: `Integration category ${suffix}`, isActive: true } });
    userId = user.id;
    categoryId = category.id;
  });

  afterAll(async () => {
    if (!prisma) return;
    if (reportId) {
      await prisma.auditLog.deleteMany({ where: { entityId: reportId } });
      await prisma.report.deleteMany({ where: { id: reportId } });
    }
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    if (categoryId) await prisma.issueCategory.deleteMany({ where: { id: categoryId } });
    await prisma.$disconnect();
  });

  it("persists a submitted report with its history, notification, and audit entry", async () => {
    const publicId = `TEST-${suffix.slice(0, 8).toUpperCase()}`;

    await prisma!.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          publicId,
          reporterId: userId,
          categoryId,
          title: "Integration test streetlight report",
          description: "This record verifies the transactional report lifecycle against PostgreSQL.",
          address: "Integration Test Street, Cebu",
          latitude: 10.3157,
          longitude: 123.8854,
          status: ReportStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });
      reportId = report.id;
      await tx.reportStatusEvent.create({ data: { reportId, actorId: userId, toStatus: ReportStatus.SUBMITTED, note: "Created by the integration suite." } });
      await tx.notification.create({ data: { userId, reportId, type: NotificationType.REPORT_SUBMITTED, title: "Report submitted", body: `${publicId} was submitted for staff review.` } });
      await tx.auditLog.create({ data: { action: "REPORT_SUBMITTED", entityType: "Report", entityId: reportId, actorId: userId, metadata: { publicId } } });
    });

    const persisted = await prisma!.report.findUniqueOrThrow({
      where: { id: reportId },
      include: { statusHistory: true, notifications: true },
    });

    expect(persisted.status).toBe(ReportStatus.SUBMITTED);
    expect(persisted.statusHistory).toHaveLength(1);
    expect(persisted.statusHistory[0]?.toStatus).toBe(ReportStatus.SUBMITTED);
    expect(persisted.notifications).toHaveLength(1);
    expect(persisted.notifications[0]?.type).toBe(NotificationType.REPORT_SUBMITTED);
    await expect(prisma!.auditLog.count({ where: { entityId: reportId, action: "REPORT_SUBMITTED" } })).resolves.toBe(1);
  });
});
