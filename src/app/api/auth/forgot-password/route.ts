import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const requestSchema = z.object({ email: z.string().trim().email().max(254) });
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const RESET_IDENTIFIER_PREFIX = "password-reset:";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function trustedOrigin(request: NextRequest) {
  const configuredOrigin = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  const origin = process.env.NODE_ENV === "production"
    ? configuredOrigin || (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : null)
    : request.nextUrl.origin;
  if (!origin) throw new Error("Set AUTH_URL to the production origin for password reset links.");
  const parsed = new URL(origin);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("Password reset requires an HTTPS AUTH_URL in production.");
  }
  return parsed.origin;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
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
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user?.passwordHash || !user.email) {
      return NextResponse.json({ message: "If an account uses that address, reset instructions will be sent." });
    }

    const rawToken = randomBytes(32).toString("base64url");
    const storedToken = hashToken(rawToken);
    const identifier = `${RESET_IDENTIFIER_PREFIX}${user.id}`;
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier } }),
      prisma.verificationToken.create({ data: { identifier, token: storedToken, expires } }),
    ]);

    const resetUrl = new URL("/reset-password", trustedOrigin(request));
    resetUrl.searchParams.set("token", rawToken);
    const url = resetUrl.toString();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (apiKey && from) {
      const name = user.name ? ` ${escapeHtml(user.name)}` : "";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [user.email],
          subject: "Reset your AgriVision.AI password",
          html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Password reset</h2><p>Hello${name},</p><p>Use the secure link below within 15 minutes to choose a new password.</p><p><a href="${escapeHtml(url)}">Reset my password</a></p><p>If you did not request this, you can ignore this message.</p></div>`,
          text: `Reset your AgriVision.AI password within 15 minutes: ${url}\n\nIf you did not request this, ignore this email.`,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        console.error("Password reset email delivery failed", { status: response.status });
        return NextResponse.json({ error: "We could not send the reset email right now. Please try again later." }, { status: 503 });
      }
    } else {
      console.info(`[password-reset] Local reset URL for ${user.email}: ${url}`);
      if (process.env.NODE_ENV === "production") {
        console.error("Password reset email is not configured; RESEND_API_KEY and RESEND_FROM_EMAIL are required.");
      }
    }

    return NextResponse.json({
      message: "If an account uses that address, reset instructions will be sent.",
      ...(!apiKey || !from
        ? process.env.NODE_ENV !== "production" ? { devResetUrl: url } : {}
        : {}),
    });
  } catch (error) {
    console.error("Password reset request failed", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "We could not start password recovery. Please try again." }, { status: 500 });
  }
}
