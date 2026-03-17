"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface LoanOfficer {
  id: string;
  name: string | null;
  email: string;
}

const AVAILABLE_CAPABILITIES = [
  "after hours support",
  "spanish speaking support",
];

const BRANCH_STATES = ["active", "inactive", "opening", "closing"];

interface BranchFormProps {
  branch?: {
    id: string;
    name: string;
    number: string;
    state: string;
    managerId: string;
    capabilities: string[];
  };
  loanOfficers: LoanOfficer[];
}

export function BranchForm({ branch, loanOfficers }: BranchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<string[]>(
    branch?.capabilities ?? [],
  );

  function toggleCapability(cap: string) {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      number: form.get("number") as string,
      state: form.get("state") as string,
      managerId: form.get("managerId") as string,
      capabilities,
    };

    const url = branch ? `/api/branches/${branch.id}` : "/api/branches";
    const method = branch ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong.");
      return;
    }

    startTransition(() => {
      router.push("/branches");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Branch Name
        </label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={branch?.name}
          placeholder="e.g. Downtown Office"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="number" className="text-sm font-medium">
          Branch Number
        </label>
        <Input
          id="number"
          name="number"
          required
          defaultValue={branch?.number}
          placeholder="e.g. BR-001"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="state" className="text-sm font-medium">
          State
        </label>
        <select
          id="state"
          name="state"
          required
          defaultValue={branch?.state ?? "active"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {BRANCH_STATES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="managerId" className="text-sm font-medium">
          Branch Manager
        </label>
        <select
          id="managerId"
          name="managerId"
          required
          defaultValue={branch?.managerId}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">Select a loan officer…</option>
          {loanOfficers.map((lo) => (
            <option key={lo.id} value={lo.id}>
              {lo.name ?? lo.email} ({lo.email})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Capabilities</span>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_CAPABILITIES.map((cap) => {
            const selected = capabilities.includes(cap);
            return (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCapability(cap)}
                className="cursor-pointer"
              >
                <Badge
                  variant={selected ? "default" : "outline"}
                  className="capitalize"
                >
                  {cap}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : branch ? "Update Branch" : "Create Branch"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
