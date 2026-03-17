import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { applicantQuery } from "@/lib/applicant-db";
import { ApplicantUsersTable } from "./applicant-users-table";

interface ApplicantUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  applicationCount: number;
}

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q } = await searchParams;

  let users: ApplicantUser[] = [];
  let error: string | null = null;

  try {
    // Query users with application count
    const query = `
      SELECT
        u.id,
        u.email,
        u.name,
        u."createdAt",
        COUNT(la.id)::int AS "applicationCount"
      FROM "User" u
      LEFT JOIN "LoanApplication" la ON la."userId" = u.id
      ${q ? `WHERE u.name ILIKE $1 OR u.email ILIKE $1` : ""}
      GROUP BY u.id
      ORDER BY u."createdAt" DESC
    `;

    const params = q ? [`%${q}%`] : [];
    users = await applicantQuery<ApplicantUser>(query, params);
  } catch (e) {
    error =
      "Could not connect to the Applicant database. Ensure APPLICANT_DATABASE_URL is configured.";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Applicant Users</h1>
      <p className="mt-1 text-muted-foreground">
        Users registered in the Applicant portal.
      </p>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <ApplicantUsersTable users={users} initialSearch={q ?? ""} />
      )}
    </div>
  );
}
