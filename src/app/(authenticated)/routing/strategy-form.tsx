"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const RISK_LEVELS = ["low", "medium", "high"];
const APP_TYPES = ["secured", "unsecured"];
const BORROWER_TYPES = ["primary", "primary plus coborrower"];
const FRAUD_OPTIONS = ["yes", "no"];

interface StrategyFormProps {
  strategy?: {
    id: string;
    name: string;
    description: string | null;
    enabled: boolean;
    maxDistanceMiles: number | null;
    allowableRisks: string[];
    appTypes: string[];
    fraudAlerts: string | null;
    allowedBorrowers: string[];
    supportsAfterHours: boolean;
    atLoanCapacity: boolean;
    supportsSpanish: boolean;
  };
}

export function StrategyForm({ strategy }: StrategyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [allowableRisks, setAllowableRisks] = useState<string[]>(
    strategy?.allowableRisks ?? [],
  );
  const [appTypes, setAppTypes] = useState<string[]>(
    strategy?.appTypes ?? [],
  );
  const [allowedBorrowers, setAllowedBorrowers] = useState<string[]>(
    strategy?.allowedBorrowers ?? [],
  );
  const [supportsAfterHours, setSupportsAfterHours] = useState(
    strategy?.supportsAfterHours ?? false,
  );
  const [atLoanCapacity, setAtLoanCapacity] = useState(
    strategy?.atLoanCapacity ?? false,
  );
  const [supportsSpanish, setSupportsSpanish] = useState(
    strategy?.supportsSpanish ?? false,
  );
  const [enabled, setEnabled] = useState(strategy?.enabled ?? true);

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      enabled,
      maxDistanceMiles: form.get("maxDistanceMiles") as string,
      allowableRisks,
      appTypes,
      fraudAlerts: form.get("fraudAlerts") as string,
      allowedBorrowers,
      supportsAfterHours,
      atLoanCapacity,
      supportsSpanish,
    };

    const url = strategy
      ? `/api/routing-strategies/${strategy.id}`
      : "/api/routing-strategies";
    const method = strategy ? "PUT" : "POST";

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
      router.push("/routing");
      router.refresh();
    });
  }

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* General */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">General</legend>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Strategy Name
          </label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={strategy?.name}
            placeholder="e.g. Local Low-Risk Routing"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Input
            id="description"
            name="description"
            defaultValue={strategy?.description ?? ""}
            placeholder="Optional description"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className="cursor-pointer"
          >
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Enabled" : "Disabled"}
            </Badge>
          </button>
          <span className="text-sm text-muted-foreground">
            Click to toggle
          </span>
        </div>
      </fieldset>

      {/* Applicant Criteria */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Applicant Criteria</legend>

        <div className="space-y-2">
          <label htmlFor="maxDistanceMiles" className="text-sm font-medium">
            Maximum Distance from Branch (miles)
          </label>
          <Input
            id="maxDistanceMiles"
            name="maxDistanceMiles"
            type="number"
            min="0"
            defaultValue={strategy?.maxDistanceMiles ?? ""}
            placeholder="e.g. 25"
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Allowable Risk Levels</span>
          <div className="flex flex-wrap gap-2">
            {RISK_LEVELS.map((risk) => {
              const selected = allowableRisks.includes(risk);
              return (
                <button
                  key={risk}
                  type="button"
                  onClick={() => toggleItem(allowableRisks, setAllowableRisks, risk)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant={selected ? "default" : "outline"}
                    className="capitalize"
                  >
                    {risk}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* Application Criteria */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Application Criteria</legend>

        <div className="space-y-2">
          <span className="text-sm font-medium">Application Types</span>
          <div className="flex flex-wrap gap-2">
            {APP_TYPES.map((type) => {
              const selected = appTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleItem(appTypes, setAppTypes, type)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant={selected ? "default" : "outline"}
                    className="capitalize"
                  >
                    {type}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="fraudAlerts" className="text-sm font-medium">
            Contains Fraud Alerts
          </label>
          <select
            id="fraudAlerts"
            name="fraudAlerts"
            defaultValue={strategy?.fraudAlerts ?? ""}
            className={selectClass}
          >
            <option value="">Any</option>
            {FRAUD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Allowed Borrowers</span>
          <div className="flex flex-wrap gap-2">
            {BORROWER_TYPES.map((type) => {
              const selected = allowedBorrowers.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    toggleItem(allowedBorrowers, setAllowedBorrowers, type)
                  }
                  className="cursor-pointer"
                >
                  <Badge
                    variant={selected ? "default" : "outline"}
                    className="capitalize"
                  >
                    {type}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* Branch Criteria */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Branch Criteria</legend>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSupportsAfterHours(!supportsAfterHours)}
            className="cursor-pointer"
          >
            <Badge variant={supportsAfterHours ? "default" : "outline"}>
              {supportsAfterHours ? "Yes" : "No"}
            </Badge>
          </button>
          <span className="text-sm font-medium">Supports After Hours</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAtLoanCapacity(!atLoanCapacity)}
            className="cursor-pointer"
          >
            <Badge variant={atLoanCapacity ? "default" : "outline"}>
              {atLoanCapacity ? "Yes" : "No"}
            </Badge>
          </button>
          <span className="text-sm font-medium">Currently at Loan Application Capacity</span>
        </div>
      </fieldset>

      {/* Person / Loan Specialist Criteria */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Loan Specialist Criteria</legend>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSupportsSpanish(!supportsSpanish)}
            className="cursor-pointer"
          >
            <Badge variant={supportsSpanish ? "default" : "outline"}>
              {supportsSpanish ? "Yes" : "No"}
            </Badge>
          </button>
          <span className="text-sm font-medium">Supports Spanish Speakers</span>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending
            ? "Saving…"
            : strategy
              ? "Update Strategy"
              : "Create Strategy"}
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
