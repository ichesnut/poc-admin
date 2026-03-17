import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loanOfficerQuery } from "@/lib/loan-officer-db";
import Link from "next/link";
import { BranchForm } from "../branch-form";

interface LoanOfficer {
  id: string;
  name: string | null;
  email: string;
}

export default async function NewBranchPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let loanOfficers: LoanOfficer[] = [];
  let error: string | null = null;

  try {
    loanOfficers = await loanOfficerQuery<LoanOfficer>(
      `SELECT id, name, email FROM users WHERE "isActive" = true ORDER BY name ASC`,
    );
  } catch {
    error =
      "Could not load loan officers. Ensure LOAN_OFFICER_DATABASE_URL is configured.";
  }

  return (
    <div>
      <Link
        href="/branches"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Branches
      </Link>

      <h1 className="mt-4 text-2xl font-bold">New Branch</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a new branch with a manager and capabilities.
      </p>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="mt-6">
          <BranchForm loanOfficers={loanOfficers} />
        </div>
      )}
    </div>
  );
}
