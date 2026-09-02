import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  agapayPrisma?: PrismaClient;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrisma() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. See docs/development.md.");
  }

  if (!globalForPrisma.agapayPrisma) {
    const adapter = new PrismaPg({ connectionString });
    globalForPrisma.agapayPrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.agapayPrisma;
}

