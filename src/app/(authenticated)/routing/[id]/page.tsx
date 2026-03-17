import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StrategyForm } from "../strategy-form";
import { DeleteStrategyButton } from "./delete-button";

export default async function StrategyDetailPage({
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

  const strategy = await prisma.routingStrategy.findUnique({ where: { id } });
  if (!strategy) return notFound();

  if (isEditing) {
    return (
      <div>
        <Link
          href={`/routing/${strategy.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Strategy
        </Link>

        <h1 className="mt-4 text-2xl font-bold">Edit Strategy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update routing criteria for this strategy.
        </p>

        <div className="mt-6">
          <StrategyForm strategy={strategy} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/routing"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Routing
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">{strategy.name}</CardTitle>
            <Badge variant={strategy.enabled ? "default" : "secondary"}>
              {strategy.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          {strategy.description && (
            <CardDescription>{strategy.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Applicant Criteria */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Applicant Criteria
            </h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Max Distance</dt>
                <dd className="mt-0.5">
                  {strategy.maxDistanceMiles
                    ? `${strategy.maxDistanceMiles} miles`
                    : "Any"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Risk Levels</dt>
                <dd className="mt-0.5 flex flex-wrap gap-1">
                  {strategy.allowableRisks.length > 0
                    ? strategy.allowableRisks.map((r) => (
                        <Badge key={r} variant="outline" className="capitalize">
                          {r}
                        </Badge>
                      ))
                    : "Any"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Application Criteria */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Application Criteria
            </h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">App Types</dt>
                <dd className="mt-0.5 flex flex-wrap gap-1">
                  {strategy.appTypes.length > 0
                    ? strategy.appTypes.map((t) => (
                        <Badge key={t} variant="outline" className="capitalize">
                          {t}
                        </Badge>
                      ))
                    : "Any"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fraud Alerts</dt>
                <dd className="mt-0.5 capitalize">
                  {strategy.fraudAlerts ?? "Any"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Borrowers</dt>
                <dd className="mt-0.5 flex flex-wrap gap-1">
                  {strategy.allowedBorrowers.length > 0
                    ? strategy.allowedBorrowers.map((b) => (
                        <Badge key={b} variant="outline" className="capitalize">
                          {b}
                        </Badge>
                      ))
                    : "Any"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Branch Criteria */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Branch Criteria
            </h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">After Hours</dt>
                <dd className="mt-0.5">
                  {strategy.supportsAfterHours ? "Required" : "Not required"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">At Loan Capacity</dt>
                <dd className="mt-0.5">
                  {strategy.atLoanCapacity ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Loan Specialist Criteria */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Loan Specialist Criteria
            </h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Spanish Speakers</dt>
                <dd className="mt-0.5">
                  {strategy.supportsSpanish ? "Required" : "Not required"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            Created {new Date(strategy.createdAt).toLocaleDateString()} · Updated{" "}
            {new Date(strategy.updatedAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/routing/${strategy.id}?edit=true`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit Strategy
        </Link>
        <DeleteStrategyButton strategyId={strategy.id} strategyName={strategy.name} />
      </div>
    </div>
  );
}
