import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import {
  NotificationType,
  PrismaClient,
  ReportPriority,
  ReportStatus,
  UserRole,
} from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed Agapay.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const categories = [
  ["road-sidewalk", "Road or sidewalk", "Damaged roads, potholes, and unsafe walkways"],
  ["drainage-flooding", "Drainage or flooding", "Blocked drains, standing water, and flood risks"],
  ["streetlight", "Streetlight", "Broken, damaged, or continuously lit streetlights"],
  ["waste-collection", "Waste collection", "Missed collection and illegal dumping"],
  ["public-safety", "Public safety", "Non-emergency hazards in shared public spaces"],
  ["other", "Other", "Community concerns that do not fit another category"],
] as const;

async function seed() {
  const demoPasswordHash = await hash(
    process.env.SEED_DEMO_PASSWORD || "AgapayDemo123!",
    12,
  );

  const categoryRecords = await Promise.all(
    categories.map(([slug, name, description]) =>
      prisma.issueCategory.upsert({
        where: { slug },
        update: { name, description, isActive: true },
        create: { slug, name, description },
      }),
    ),
  );

  const categoryBySlug = new Map(categoryRecords.map((category) => [category.slug, category]));

  const serviceArea = await prisma.serviceArea.upsert({
    where: { slug: "barangay-demo" },
    update: { name: "Barangay Demo", isActive: true },
    create: { slug: "barangay-demo", name: "Barangay Demo" },
  });

  const resident = await prisma.user.upsert({
    where: { email: "resident@agapay.local" },
    update: { name: "Juan Dela Cruz", role: UserRole.RESIDENT, passwordHash: demoPasswordHash },
    create: {
      email: "resident@agapay.local",
      name: "Juan Dela Cruz",
      role: UserRole.RESIDENT,
      passwordHash: demoPasswordHash,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@agapay.local" },
    update: { name: "Maria Santos", role: UserRole.STAFF, passwordHash: demoPasswordHash },
    create: {
      email: "staff@agapay.local",
      name: "Maria Santos",
      role: UserRole.STAFF,
      passwordHash: demoPasswordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@agapay.local" },
    update: { name: "Agapay Administrator", role: UserRole.ADMIN, passwordHash: demoPasswordHash },
    create: {
      email: "admin@agapay.local",
      name: "Agapay Administrator",
      role: UserRole.ADMIN,
      passwordHash: demoPasswordHash,
    },
  });

  const maintenanceTeam = await prisma.responseTeam.upsert({
    where: {
      name_serviceAreaId: {
        name: "Community Maintenance Team",
        serviceAreaId: serviceArea.id,
      },
    },
    update: { contactEmail: "maintenance@agapay.local", isActive: true },
    create: {
      name: "Community Maintenance Team",
      contactEmail: "maintenance@agapay.local",
      serviceAreaId: serviceArea.id,
    },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: maintenanceTeam.id, userId: staff.id } },
    update: {},
    create: { teamId: maintenanceTeam.id, userId: staff.id },
  });

  const reportDefinitions = [
    {
      publicId: "AGP-1042",
      title: "Streetlight not working near the covered court",
      description:
        "The streetlight beside the covered court has not turned on for three nights. The walkway becomes very dark after 7 PM.",
      address: "Mabini Street",
      latitude: 14.5995,
      longitude: 120.9842,
      categorySlug: "streetlight",
      status: ReportStatus.IN_PROGRESS,
      priority: ReportPriority.NORMAL,
      submittedAt: new Date("2026-08-30T09:15:00+08:00"),
      verifiedAt: new Date("2026-08-31T10:30:00+08:00"),
      assignedTeamId: maintenanceTeam.id,
      assignedStaffId: staff.id,
    },
    {
      publicId: "AGP-1031",
      title: "Blocked drainage after heavy rain",
      description:
        "Leaves and plastic waste are blocking the drainage channel. Water remains on the road several hours after rainfall.",
      address: "Rizal Avenue",
      latitude: 14.6001,
      longitude: 120.9827,
      categorySlug: "drainage-flooding",
      status: ReportStatus.VERIFIED,
      priority: ReportPriority.HIGH,
      submittedAt: new Date("2026-08-27T14:20:00+08:00"),
      verifiedAt: new Date("2026-08-28T08:45:00+08:00"),
      assignedTeamId: null,
      assignedStaffId: null,
    },
    {
      publicId: "AGP-0988",
      title: "Pothole beside the public market entrance",
      description:
        "A deep pothole near the market entrance was causing motorcycles to swerve into the opposite lane, especially during busy hours.",
      address: "Market Road",
      latitude: 14.5989,
      longitude: 120.9851,
      categorySlug: "road-sidewalk",
      status: ReportStatus.RESOLVED,
      priority: ReportPriority.HIGH,
      submittedAt: new Date("2026-08-18T07:40:00+08:00"),
      verifiedAt: new Date("2026-08-18T13:10:00+08:00"),
      resolvedAt: new Date("2026-08-22T16:30:00+08:00"),
      assignedTeamId: maintenanceTeam.id,
      assignedStaffId: staff.id,
    },
  ] as const;

  for (const definition of reportDefinitions) {
    const category = categoryBySlug.get(definition.categorySlug);
    if (!category) throw new Error(`Missing seed category: ${definition.categorySlug}`);

    const report = await prisma.report.upsert({
      where: { publicId: definition.publicId },
      update: {
        title: definition.title,
        description: definition.description,
        address: definition.address,
        latitude: definition.latitude,
        longitude: definition.longitude,
        categoryId: category.id,
        status: definition.status,
        priority: definition.priority,
        submittedAt: definition.submittedAt,
        verifiedAt: definition.verifiedAt,
        resolvedAt: "resolvedAt" in definition ? definition.resolvedAt : null,
        assignedTeamId: definition.assignedTeamId,
        assignedStaffId: definition.assignedStaffId,
      },
      create: {
        publicId: definition.publicId,
        title: definition.title,
        description: definition.description,
        address: definition.address,
        latitude: definition.latitude,
        longitude: definition.longitude,
        categoryId: category.id,
        reporterId: resident.id,
        serviceAreaId: serviceArea.id,
        status: definition.status,
        priority: definition.priority,
        submittedAt: definition.submittedAt,
        verifiedAt: definition.verifiedAt,
        resolvedAt: "resolvedAt" in definition ? definition.resolvedAt : null,
        assignedTeamId: definition.assignedTeamId,
        assignedStaffId: definition.assignedStaffId,
      },
    });

    await prisma.reportStatusEvent.deleteMany({ where: { reportId: report.id } });

    const events = [
      {
        toStatus: ReportStatus.SUBMITTED,
        note: "Report received from the resident portal.",
        actorId: resident.id,
        createdAt: definition.submittedAt,
      },
      {
        fromStatus: ReportStatus.SUBMITTED,
        toStatus: ReportStatus.VERIFIED,
        note: "Location and report details were verified.",
        actorId: staff.id,
        createdAt: definition.verifiedAt,
      },
      ...(definition.status === ReportStatus.IN_PROGRESS || definition.status === ReportStatus.RESOLVED
        ? [
            {
              fromStatus: ReportStatus.VERIFIED,
              toStatus: ReportStatus.IN_PROGRESS,
              note: "Assigned to the Community Maintenance Team.",
              actorId: staff.id,
              createdAt: new Date(definition.verifiedAt.getTime() + 86_400_000),
            },
          ]
        : []),
      ...(definition.status === ReportStatus.RESOLVED && "resolvedAt" in definition
        ? [
            {
              fromStatus: ReportStatus.IN_PROGRESS,
              toStatus: ReportStatus.RESOLVED,
              note: "Repair completed and checked by the response team.",
              actorId: staff.id,
              createdAt: definition.resolvedAt,
            },
          ]
        : []),
    ];

    await prisma.reportStatusEvent.createMany({
      data: events.map((event) => ({ ...event, reportId: report.id })),
    });
  }

  const activeReport = await prisma.report.findUniqueOrThrow({ where: { publicId: "AGP-1042" } });
  await prisma.notification.deleteMany({
    where: { userId: resident.id, reportId: activeReport.id },
  });
  await prisma.notification.create({
    data: {
      userId: resident.id,
      reportId: activeReport.id,
      type: NotificationType.REPORT_ASSIGNED,
      title: "Your report is now in progress",
      body: "AGP-1042 was assigned to the Community Maintenance Team.",
    },
  });

  console.info(
    `Seeded ${categoryRecords.length} categories, 3 users, 1 response team, and ${reportDefinitions.length} reports.`,
  );
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
