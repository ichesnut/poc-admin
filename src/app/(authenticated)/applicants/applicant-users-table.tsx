"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";

interface ApplicantUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  applicationCount: number;
}

export function ApplicantUsersTable({
  users,
  initialSearch,
}: {
  users: ApplicantUser[];
  initialSearch: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`/applicants${params.size ? `?${params}` : ""}`);
  }

  return (
    <div className="mt-6 space-y-4">
      <form onSubmit={handleSearch} className="flex max-w-sm gap-2">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Applications</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No applicant users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/applicants/${user.id}`}
                      className="font-medium hover:underline"
                    >
                      {user.name ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell><span className="inline-flex items-center gap-1">{user.email} <CopyButton value={user.email} /></span></TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{user.applicationCount}</Badge>
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
