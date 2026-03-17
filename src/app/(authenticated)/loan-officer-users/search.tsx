"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function LoanOfficerSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`/loan-officer-users?${params.toString()}`);
    });
  }

  return (
    <div className="relative max-w-sm">
      <Input
        type="search"
        placeholder="Search by name or email…"
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        className={isPending ? "opacity-60" : ""}
      />
    </div>
  );
}
