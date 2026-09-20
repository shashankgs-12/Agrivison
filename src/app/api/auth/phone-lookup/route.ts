import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const last10Digits = cleanPhone.slice(-10);

    // Search PostgreSQL DB for user by phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: last10Digits },
          { phone: `+91${last10Digits}` },
          { phone: `+91 ${last10Digits}` },
          { phone: `0${last10Digits}` },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        location: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `Mobile number ${phone} not found in database. User not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || phone,
        role: user.role?.toLowerCase() || "farmer",
        location: user.location || "GPS Location Active",
        subscription: user.subscription || "FREE",
      },
    });
  } catch (error) {
    console.error("Phone lookup failed:", error);
    return NextResponse.json(
      { error: "Unable to verify phone number. Please try again." },
      { status: 500 }
    );
  }
}
