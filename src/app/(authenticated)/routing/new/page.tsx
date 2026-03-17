import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StrategyForm } from "../strategy-form";

export default async function NewStrategyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <Link
        href="/routing"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Routing
      </Link>

      <h1 className="mt-4 text-2xl font-bold">New Routing Strategy</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Define criteria for routing applications to branches.
      </p>

      <div className="mt-6">
        <StrategyForm />
      </div>
    </div>
  );
}
