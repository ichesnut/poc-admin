import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { applicantQuery } from "@/lib/applicant-db";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";

interface ApplicantUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

interface LoanApplication {
  id: string;
  referenceId: string;
  status: string;
  loanAmount: number;
  loanTerm: number;
  loanPurpose: string;
  firstName: string;
  lastName: string;
  submittedAt: Date | null;
  createdAt: Date;
}

const statusColors: Record<string, string> = {
  DRAFT: "outline",
  SUBMITTED: "default",
  UNDER_REVIEW: "secondary",
  APPROVED: "default",
  DENIED: "destructive",
  MORE_INFO_NEEDED: "secondary",
};

function StatusBadge({ status }: { status: string }) {
  const variant = statusColors[status] ?? "outline";
  // Use inline styles for APPROVED since Badge doesn't have a "success" variant
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        {status.replace(/_/g, " ")}
      </span>
    );
  }
  return (
    <Badge variant={variant as "default" | "secondary" | "destructive" | "outline"}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  // Fetch user info
  const users = await applicantQuery<ApplicantUser>(
    'SELECT id, email, name, "createdAt" FROM "User" WHERE id = $1',
    [id],
  );

  if (users.length === 0) notFound();
  const user = users[0];

  // Fetch their loan applications
  const applications = await applicantQuery<LoanApplication>(
    `SELECT id, "referenceId", status, "loanAmount", "loanTerm", "loanPurpose",
            "firstName", "lastName", "submittedAt", "createdAt"
     FROM "LoanApplication"
     WHERE "userId" = $1
     ORDER BY "createdAt" DESC`,
    [id],
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/applicants"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Applicant Users
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user.name ?? "Unnamed User"}</CardTitle>
          <CardDescription><span className="inline-flex items-center gap-1">{user.email} <CopyButton value={user.email} /></span></CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">User ID</dt>
              <dd className="mt-1 inline-flex items-center gap-1 font-mono text-xs">{user.id} <CopyButton value={user.id} /></dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Registered
              </dt>
              <dd className="mt-1">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Total Applications
              </dt>
              <dd className="mt-1">{applications.length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold">Loan Applications</h2>

        {applications.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            This user has no loan applications.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs">
                      <span className="inline-flex items-center gap-1">{app.referenceId} <CopyButton value={app.referenceId} /></span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(app.loanAmount)}</TableCell>
                    <TableCell>{app.loanTerm} months</TableCell>
                    <TableCell className="capitalize">
                      {app.loanPurpose.toLowerCase().replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
