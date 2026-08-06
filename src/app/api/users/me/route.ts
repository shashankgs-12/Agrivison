import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { profileSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  try {
    const payload: unknown = await request.json();
    const parsedInput = profileSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        { error: parsedInput.error.issues[0]?.message ?? "Invalid profile details." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsedInput.data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        location: true,
        role: true,
        subscription: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json(
      { error: "Unable to update your profile. Please try again." },
      { status: 500 }
    );
  }
}
