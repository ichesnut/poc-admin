import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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

  const existing = await prisma.routingStrategy.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Strategy not found." }, { status: 404 });
  }

  const strategy = await prisma.routingStrategy.update({
    where: { id },
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

  return NextResponse.json(strategy);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.routingStrategy.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Strategy not found." }, { status: 404 });
  }

  await prisma.routingStrategy.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
