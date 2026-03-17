import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loanOfficerQuery } from "@/lib/loan-officer-db";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoanOfficerSearch } from "./search";

interface LoanOfficerRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  active_count: string;
  booked_count: string;
  declined_count: string;
}

export default async function LoanOfficerUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q } = await searchParams;

  let users: LoanOfficerRow[] = [];
  let error: string | null = null;

  try {
    const searchFilter = q
      ? `WHERE u.name ILIKE $1 OR u.email ILIKE $1`
      : "";
    const params = q ? [`%${q}%`] : [];

    users = await loanOfficerQuery<LoanOfficerRow>(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u."isActive",
        u."createdAt",
        COALESCE(SUM(CASE WHEN la.status IN ('submitted', 'in_review', 'conditionally_approved', 'closing') THEN 1 ELSE 0 END), 0) AS active_count,
        COALESCE(SUM(CASE WHEN la.status = 'closed' THEN 1 ELSE 0 END), 0) AS booked_count,
        COALESCE(SUM(CASE WHEN la.status = 'declined' THEN 1 ELSE 0 END), 0) AS declined_count
      FROM users u
      LEFT JOIN loan_applications la ON la."officerId" = u.id
      ${searchFilter}
      GROUP BY u.id
      ORDER BY u."createdAt" DESC`,
      params,
    );
  } catch {
    error =
      "Could not connect to the Loan Officer database. Ensure LOAN_OFFICER_DATABASE_URL is configured.";
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loan Officer Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} user{users.length !== 1 ? "s" : ""} registered in the
            Loan Officer portal.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <LoanOfficerSearch defaultValue={q} />
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Name</TableHead>
                <TableHead className="px-4">Email</TableHead>
                <TableHead className="px-4">Role</TableHead>
                <TableHead className="px-4 text-center">Active</TableHead>
                <TableHead className="px-4 text-center">Booked</TableHead>
                <TableHead className="px-4 text-center">Declined</TableHead>
                <TableHead className="px-4">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {q ? "No loan officers match your search." : "No loan officer users found."}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer">
                    <TableCell className="px-4">
                      <Link
                        href={`/loan-officer-users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.name ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4">{user.email}</TableCell>
                    <TableCell className="px-4">
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      {Number(user.active_count) > 0 ? (
                        <Badge variant="default">{user.active_count}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      {Number(user.booked_count) > 0 ? (
                        <Badge variant="secondary">{user.booked_count}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      {Number(user.declined_count) > 0 ? (
                        <Badge variant="destructive">
                          {user.declined_count}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const label = role.replace(/_/g, " ");
  const variant =
    role === "admin"
      ? "default"
      : role === "branch_manager"
        ? "secondary"
        : "outline";

  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}
