import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ farmId: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { farmId } = await params;
  if (!/^\d+$/.test(farmId)) return NextResponse.json({ error: "The selected farm ID is invalid." }, { status: 400 });

  try {
    const result = await prisma.farm.deleteMany({ where: { id: Number(farmId), ownerId: userId } });
    if (result.count === 0) return NextResponse.json({ error: "Farm not found for this account." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Farm delete failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Farm could not be deleted." }, { status: 500 });
  }
}
