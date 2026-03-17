// Admin database — owns AdminUser, Account, Session tables.
// Usage: import { prisma } from "@/lib/db";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// Invalidate cached client if it's stale (missing models added after initial creation)
if (
  globalForPrisma.prisma &&
  (!globalForPrisma.prisma.branch || !globalForPrisma.prisma.routingStrategy)
) {
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
