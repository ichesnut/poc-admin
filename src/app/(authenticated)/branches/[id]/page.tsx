import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { loanOfficerQuery } from "@/lib/loan-officer-db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BranchForm } from "../branch-form";
import { CopyButton } from "@/components/copy-button";
import { DeleteBranchButton } from "./delete-button";

interface LoanOfficer {
  id: string;
  name: string | null;
  email: string;
}

const STATE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "destructive",
  opening: "secondary",
  closing: "outline",
};

export default async function BranchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const { edit } = await searchParams;
  const isEditing = edit === "true";

  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) return notFound();

  // If editing, load loan officers for the form
  let loanOfficers: LoanOfficer[] = [];
  if (isEditing) {
    try {
      loanOfficers = await loanOfficerQuery<LoanOfficer>(
        `SELECT id, name, email FROM users WHERE "isActive" = true ORDER BY name ASC`,
      );
    } catch {
      // Fall back to empty — form will still work with current manager
    }
  }

  if (isEditing) {
    return (
      <div>
        <Link
          href={`/branches/${branch.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Branch
        </Link>

        <h1 className="mt-4 text-2xl font-bold">Edit Branch</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update branch details, manager, or capabilities.
        </p>

        <div className="mt-6">
          <BranchForm
            branch={{
              id: branch.id,
              name: branch.name,
              number: branch.number,
              state: branch.state,
              managerId: branch.managerId,
              capabilities: branch.capabilities,
            }}
            loanOfficers={loanOfficers}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/branches"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Branches
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">{branch.name}</CardTitle>
            <Badge variant={STATE_VARIANTS[branch.state] ?? "outline"} className="capitalize">
              {branch.state}
            </Badge>
          </div>
          <CardDescription><span className="inline-flex items-center gap-1">Branch #{branch.number} <CopyButton value={branch.number} /></span></CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Branch Number</dt>
              <dd className="mt-0.5 inline-flex items-center gap-1 font-mono">{branch.number} <CopyButton value={branch.number} /></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">State</dt>
              <dd className="mt-0.5 capitalize">{branch.state}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Manager</dt>
              <dd className="mt-0.5">{branch.managerName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="mt-0.5">{new Date(branch.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          {branch.capabilities.length > 0 && (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Capabilities</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {branch.capabilities.map((cap) => (
                  <Badge key={cap} variant="outline" className="capitalize">
                    {cap}
                  </Badge>
                ))}
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/branches/${branch.id}?edit=true`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit Branch
        </Link>
        <DeleteBranchButton branchId={branch.id} branchName={branch.name} />
      </div>
    </div>
  );
}
