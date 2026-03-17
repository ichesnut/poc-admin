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
import { BranchSearch } from "./search";

const STATE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "destructive",
  opening: "secondary",
  closing: "outline",
};

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q } = await searchParams;

  const branches = await prisma.branch.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { number: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branches</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {branches.length} branch{branches.length !== 1 ? "es" : ""} configured.
          </p>
        </div>
        <Link
          href="/branches/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Branch
        </Link>
      </div>

      <div className="mt-4">
        <BranchSearch defaultValue={q} />
      </div>

      <div className="mt-4 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Name</TableHead>
              <TableHead className="px-4">Number</TableHead>
              <TableHead className="px-4">State</TableHead>
              <TableHead className="px-4">Manager</TableHead>
              <TableHead className="px-4">Capabilities</TableHead>
              <TableHead className="px-4">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {q ? "No branches match your search." : "No branches found."}
                </TableCell>
              </TableRow>
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id} className="cursor-pointer">
                  <TableCell className="px-4">
                    <Link
                      href={`/branches/${branch.id}`}
                      className="font-medium hover:underline"
                    >
                      {branch.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 font-mono text-xs">
                    {branch.number}
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge variant={STATE_VARIANTS[branch.state] ?? "outline"} className="capitalize">
                      {branch.state}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    {branch.managerName ?? "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-wrap gap-1">
                      {branch.capabilities.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                      {branch.capabilities.length === 0 && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-muted-foreground">
                    {new Date(branch.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
