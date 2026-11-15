import { createHash } from "node:crypto";
import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const resetSchema = z.object({
  token: z.string().min(32).max(128),
  password: z.string().min(12).max(128),
});
const RESET_IDENTIFIER_PREFIX = "password-reset:";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "This reset link is invalid or expired. Request a new one." }, { status: 400 });
  }
  const parsed = resetSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a password with at least 12 characters and use a valid reset link." }, { status: 400 });
  }

  try {
    const tokenHash = hashToken(parsed.data.token);
    const passwordHash = await hash(parsed.data.password, 12);
    const now = new Date();
    await prisma.$transaction(async (transaction) => {
      const resetToken = await transaction.verificationToken.findUnique({ where: { token: tokenHash } });
      if (
        !resetToken ||
        !resetToken.identifier.startsWith(RESET_IDENTIFIER_PREFIX) ||
        resetToken.expires <= now
      ) {
        throw new Error("RESET_TOKEN_INVALID");
      }

      const userId = resetToken.identifier.slice(RESET_IDENTIFIER_PREFIX.length);
      const consumed = await transaction.verificationToken.deleteMany({
        where: {
          token: tokenHash,
          identifier: resetToken.identifier,
          expires: { gt: now },
        },
      });
      if (consumed.count !== 1) throw new Error("RESET_TOKEN_INVALID");

      const updated = await transaction.user.updateMany({
        where: { id: userId, passwordHash: { not: null } },
        data: { passwordHash },
      });
      if (updated.count !== 1) throw new Error("RESET_TOKEN_INVALID");

      await transaction.verificationToken.deleteMany({ where: { identifier: resetToken.identifier } });
    });

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    if (error instanceof Error && error.message === "RESET_TOKEN_INVALID") {
      return NextResponse.json({ error: "This reset link is invalid or expired. Request a new one." }, { status: 400 });
    }
    console.error("Password update failed", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Password could not be updated. Please request a new link and try again." }, { status: 500 });
  }
}
