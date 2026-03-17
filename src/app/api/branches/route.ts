import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loanOfficerQuery } from "@/lib/loan-officer-db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, number, state, managerId, capabilities } = body;

  if (!name || !number || !state || !managerId) {
    return NextResponse.json(
      { error: "Name, number, state, and manager are required." },
      { status: 400 },
    );
  }

  // Look up manager name from loan officer database
  let managerName: string | null = null;
  try {
    const managers = await loanOfficerQuery<{ name: string | null; email: string }>(
      `SELECT name, email FROM users WHERE id = $1`,
      [managerId],
    );
    if (managers.length === 0) {
      return NextResponse.json(
        { error: "Selected manager not found in loan officer database." },
        { status: 400 },
      );
    }
    managerName = managers[0].name ?? managers[0].email;
  } catch {
    return NextResponse.json(
      { error: "Could not verify manager. Check loan officer database connection." },
      { status: 500 },
    );
  }

  // Check for duplicate branch number
  const existing = await prisma.branch.findUnique({ where: { number } });
  if (existing) {
    return NextResponse.json(
      { error: `Branch number "${number}" already exists.` },
      { status: 409 },
    );
  }

  const branch = await prisma.branch.create({
    data: {
      name,
      number,
      state,
      managerId,
      managerName,
      capabilities: capabilities ?? [],
    },
  });

  return NextResponse.json(branch, { status: 201 });
}
