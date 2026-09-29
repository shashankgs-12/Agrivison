import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { profileSchema } from "@/lib/auth/validation";
import { findUserByPhone } from "@/lib/auth/phone-lookup";
import { prisma } from "@/lib/prisma";
import { toSessionImage } from "@/lib/auth/profile-image";

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

    if (parsedInput.data.phone) {
      const existingPhone = await findUserByPhone(
        parsedInput.data.phone,
        session.user.id
      );
      if (existingPhone) {
        return NextResponse.json(
          { error: "This mobile number is already registered to another account." },
          { status: 409 }
        );
      }
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

    return NextResponse.json({
      user: { ...user, image: toSessionImage(user.image) },
    });
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json(
      { error: "Unable to update your profile. Please try again." },
      { status: 500 }
    );
  }
}
