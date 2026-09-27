import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/auth/validation";
import { findUserByPhone } from "@/lib/auth/phone-lookup";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function hasTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const payload: unknown = await request.json();
    const parsedInput = registrationSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        { error: parsedInput.error.issues[0]?.message ?? "Invalid registration details." },
        { status: 400 }
      );
    }

    const email = parsedInput.data.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists for this email address." },
        { status: 409 }
      );
    }

    if (parsedInput.data.phone) {
      const existingPhone = await findUserByPhone(parsedInput.data.phone);
      if (existingPhone) {
        return NextResponse.json(
          { error: "This mobile number is already registered. Sign in instead." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hash(parsedInput.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsedInput.data.name,
        email,
        phone: parsedInput.data.phone,
        passwordHash,
        role: "FARMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account already exists with one of these details." },
        { status: 409 }
      );
    }
    console.error("Registration failed", error);
    return NextResponse.json(
      { error: "Unable to create your account. Please try again." },
      { status: 500 }
    );
  }
}
