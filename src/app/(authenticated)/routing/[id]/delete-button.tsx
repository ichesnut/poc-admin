"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function DeleteStrategyButton({
  strategyId,
  strategyName,
}: {
  strategyId: string;
  strategyName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/routing-strategies/${strategyId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      startTransition(() => {
        router.push("/routing");
        router.refresh();
      });
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-destructive">
          Delete &quot;{strategyName}&quot;?
        </span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
    >
      Delete Strategy
    </button>
  );
}
