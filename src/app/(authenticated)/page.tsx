import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back, {session.user.name ?? session.user.email}.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href="/applicant-users"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <h2 className="text-lg font-semibold">Applicant Users</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage applicant accounts
          </p>
        </a>
        <a
          href="/loan-officer-users"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <h2 className="text-lg font-semibold">Loan Officer Users</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage loan officer accounts
          </p>
        </a>
      </div>
    </div>
  );
}
