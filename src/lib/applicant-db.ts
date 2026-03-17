// Read-only Prisma client for the Applicant app database.
// This connects directly to the applicant PostgreSQL database.
// Usage: import { applicantPrisma } from "@/lib/applicant-db";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForApplicant = globalThis as unknown as {
  applicantPool: pg.Pool | undefined;
};

function getPool() {
  if (!globalForApplicant.applicantPool) {
    globalForApplicant.applicantPool = new pg.Pool({
      connectionString: process.env.APPLICANT_DATABASE_URL!,
    });
  }
  return globalForApplicant.applicantPool;
}

// Raw query helper for the applicant database
export async function applicantQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows as T[];
}
