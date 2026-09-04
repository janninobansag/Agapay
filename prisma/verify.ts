import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to verify Agapay's database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function verify() {
  const [users, loginEnabledUsers, categories, teams, reports, events, notifications, reportIds] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { passwordHash: { not: null } } }),
      prisma.issueCategory.count(),
      prisma.responseTeam.count(),
      prisma.report.count(),
      prisma.reportStatusEvent.count(),
      prisma.notification.count(),
      prisma.report.findMany({
        select: { publicId: true, status: true },
        orderBy: { publicId: "asc" },
      }),
    ]);

  console.info({
    users,
    loginEnabledUsers,
    categories,
    teams,
    reports,
    statusEvents: events,
    notifications,
    reportIds,
  });
}

verify()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
