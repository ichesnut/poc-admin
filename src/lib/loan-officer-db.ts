// Read-only query helper for the Loan Officer app database.
// Usage: import { loanOfficerQuery } from "@/lib/loan-officer-db";

import pg from "pg";

const globalForLoanOfficer = globalThis as unknown as {
  loanOfficerPool: pg.Pool | undefined;
};

function getPool() {
  if (!globalForLoanOfficer.loanOfficerPool) {
    globalForLoanOfficer.loanOfficerPool = new pg.Pool({
      connectionString: process.env.LOAN_OFFICER_DATABASE_URL!,
    });
  }
  return globalForLoanOfficer.loanOfficerPool;
}

export async function loanOfficerQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows as T[];
}
