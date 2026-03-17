import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
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
import { RoutingSearch } from "./search";

export default async function RoutingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q } = await searchParams;

  let strategies: Awaited<ReturnType<typeof prisma.routingStrategy.findMany>> = [];
  let error: string | null = null;

  try {
    strategies = await prisma.routingStrategy.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    error =
      "Could not load routing strategies. Ensure DATABASE_URL is configured and the database is migrated.";
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Routing Strategies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {strategies.length} strateg{strategies.length !== 1 ? "ies" : "y"} configured.
          </p>
        </div>
        <Link
          href="/routing/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Strategy
        </Link>
      </div>

      <div className="mt-4">
        <RoutingSearch defaultValue={q} />
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
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Applicant Criteria</TableHead>
                <TableHead className="px-4">Application Criteria</TableHead>
                <TableHead className="px-4">Branch Criteria</TableHead>
                <TableHead className="px-4">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {q ? "No strategies match your search." : "No routing strategies found."}
                  </TableCell>
                </TableRow>
              ) : (
                strategies.map((strategy) => (
                  <TableRow key={strategy.id} className="cursor-pointer">
                    <TableCell className="px-4">
                      <Link
                        href={`/routing/${strategy.id}`}
                        className="font-medium hover:underline"
                      >
                        {strategy.name}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant={strategy.enabled ? "default" : "secondary"}>
                        {strategy.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-wrap gap-1">
                        {strategy.maxDistanceMiles && (
                          <Badge variant="outline" className="text-xs">
                            ≤{strategy.maxDistanceMiles} mi
                          </Badge>
                        )}
                        {strategy.allowableRisks.map((r) => (
                          <Badge key={r} variant="outline" className="text-xs capitalize">
                            {r} risk
                          </Badge>
                        ))}
                        {!strategy.maxDistanceMiles && strategy.allowableRisks.length === 0 && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-wrap gap-1">
                        {strategy.appTypes.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs capitalize">
                            {t}
                          </Badge>
                        ))}
                        {strategy.appTypes.length === 0 && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-wrap gap-1">
                        {strategy.supportsAfterHours && (
                          <Badge variant="outline" className="text-xs">after hours</Badge>
                        )}
                        {strategy.atLoanCapacity && (
                          <Badge variant="outline" className="text-xs">at capacity</Badge>
                        )}
                        {!strategy.supportsAfterHours && !strategy.atLoanCapacity && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {new Date(strategy.createdAt).toLocaleDateString()}
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
