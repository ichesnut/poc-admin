import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    description,
    enabled,
    maxDistanceMiles,
    allowableRisks,
    appTypes,
    fraudAlerts,
    allowedBorrowers,
    supportsAfterHours,
    atLoanCapacity,
    supportsSpanish,
  } = body;

  if (!name) {
    return NextResponse.json(
      { error: "Strategy name is required." },
      { status: 400 },
    );
  }

  const strategy = await prisma.routingStrategy.create({
    data: {
      name,
      description: description || null,
      enabled: enabled ?? true,
      maxDistanceMiles: maxDistanceMiles ? parseInt(maxDistanceMiles, 10) : null,
      allowableRisks: allowableRisks ?? [],
      appTypes: appTypes ?? [],
      fraudAlerts: fraudAlerts || null,
      allowedBorrowers: allowedBorrowers ?? [],
      supportsAfterHours: supportsAfterHours ?? false,
      atLoanCapacity: atLoanCapacity ?? false,
      supportsSpanish: supportsSpanish ?? false,
    },
  });

  return NextResponse.json(strategy, { status: 201 });
}
