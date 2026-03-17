import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoanOfficerUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface ApplicationRow {
  id: string;
  loanNumber: string;
  status: string;
  loanType: string;
  purpose: string;
  requestedAmount: string;
  termMonths: number;
  createdAt: Date;
  updatedAt: Date;
  borrower_name: string | null;
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  submitted: "default",
  in_review: "default",
  approved: "secondary",
  conditionally_approved: "secondary",
  declined: "destructive",
  closing: "default",
  closed: "secondary",
  withdrawn: "outline",
};

export default async function LoanOfficerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  let user: LoanOfficerUser | null = null;
  let applications: ApplicationRow[] = [];
  let error: string | null = null;

  try {
    const users = await loanOfficerQuery<LoanOfficerUser>(
      `SELECT id, email, name, role, "isActive", "createdAt" FROM users WHERE id = $1`,
      [id],
    );
    if (users.length === 0) return notFound();
    user = users[0];

    applications = await loanOfficerQuery<ApplicationRow>(
      `SELECT
        la.id,
        la."loanNumber",
        la.status,
        la."loanType",
        la.purpose,
        la."requestedAmount",
        la."termMonths",
        la."createdAt",
        la."updatedAt",
        (SELECT CONCAT(b."firstName", ' ', b."lastName") FROM borrowers b WHERE b."applicationId" = la.id AND b."isPrimary" = true LIMIT 1) AS borrower_name
      FROM loan_applications la
      WHERE la."officerId" = $1
      ORDER BY la."updatedAt" DESC`,
      [id],
    );
  } catch {
    error =
      "Could not connect to the Loan Officer database. Ensure LOAN_OFFICER_DATABASE_URL is configured.";
  }

  if (error) {
    return (
      <div>
        <BackLink />
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!user) return notFound();

  // Group applications by category
  const activeStatuses = new Set(["submitted", "in_review", "conditionally_approved", "closing"]);
  const assigned = applications.filter((a) => activeStatuses.has(a.status));
  const booked = applications.filter((a) => a.status === "closed");
  const declined = applications.filter((a) => a.status === "declined");

  return (
    <div>
      <BackLink />

      {/* User Info */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">{user.name ?? "Unnamed User"}</CardTitle>
            <Badge variant={user.isActive ? "secondary" : "destructive"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-0.5 capitalize">{user.role.replace(/_/g, " ")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Registered</dt>
              <dd className="mt-0.5">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Active Applications</dt>
              <dd className="mt-0.5">{assigned.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total Applications</dt>
              <dd className="mt-0.5">{applications.length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Currently Assigned Applications */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Currently Assigned Applications
          {assigned.length > 0 && (
            <Badge variant="default" className="ml-2">{assigned.length}</Badge>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applications with status: submitted, in review, conditionally approved, or closing.
        </p>
        <div className="mt-3">
          <ApplicationTable applications={assigned} emptyMessage="No active applications." />
        </div>
      </section>

      {/* Booked Loans */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Booked Loans
          {booked.length > 0 && (
            <Badge variant="secondary" className="ml-2">{booked.length}</Badge>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Successfully closed loans.
        </p>
        <div className="mt-3">
          <ApplicationTable applications={booked} emptyMessage="No booked loans." />
        </div>
      </section>

      {/* Declined Applications */}
      <section className="mt-8 pb-8">
        <h2 className="text-lg font-semibold">
          Declined Applications
          {declined.length > 0 && (
            <Badge variant="destructive" className="ml-2">{declined.length}</Badge>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applications that were declined.
        </p>
        <div className="mt-3">
          <ApplicationTable applications={declined} emptyMessage="No declined applications." />
        </div>
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/loan-officer-users"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      ← Back to Loan Officers
    </Link>
  );
}

function ApplicationTable({
  applications,
  emptyMessage,
}: {
  applications: ApplicationRow[];
  emptyMessage: string;
}) {
  if (applications.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Loan #</TableHead>
            <TableHead className="px-4">Borrower</TableHead>
            <TableHead className="px-4">Amount</TableHead>
            <TableHead className="px-4">Status</TableHead>
            <TableHead className="px-4">Type</TableHead>
            <TableHead className="px-4">Created</TableHead>
            <TableHead className="px-4">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="px-4 font-mono text-xs">
                {app.loanNumber.slice(0, 12)}…
              </TableCell>
              <TableCell className="px-4">
                {app.borrower_name ?? "—"}
              </TableCell>
              <TableCell className="px-4">
                ${Number(app.requestedAmount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell className="px-4">
                <StatusBadge status={app.status} />
              </TableCell>
              <TableCell className="px-4 capitalize">
                {app.loanType.replace(/_/g, " ")}
              </TableCell>
              <TableCell className="px-4 text-muted-foreground">
                {new Date(app.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-4 text-muted-foreground">
                {new Date(app.updatedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_COLORS[status] ?? "outline";
  const label = status.replace(/_/g, " ");

  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}
