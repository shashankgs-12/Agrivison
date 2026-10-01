import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ cropId: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { cropId } = await params;
  if (!cropId || cropId.length > 100) return NextResponse.json({ error: "The selected crop ID is invalid." }, { status: 400 });
  try {
    const result = await prisma.crop.deleteMany({ where: { id: cropId, farm: { ownerId: userId } } });
    if (result.count === 0) return NextResponse.json({ error: "Crop not found for this account." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Crop delete failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Crop could not be deleted." }, { status: 500 });
  }
}
