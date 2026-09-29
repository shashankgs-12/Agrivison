import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  PROFILE_AVATAR_DATA_URL_PREFIX,
  PROFILE_AVATAR_ENDPOINT,
} from "@/lib/auth/profile-image";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 720 * 1024;

async function readRequestBody(request: NextRequest): Promise<Uint8Array | null> {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel().catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function is512PixelJpeg(bytes: Buffer): boolean {
  const frameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;

  while (offset < bytes.length - 4) {
    if (bytes[offset] !== 0xff) return false;
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) return false;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    if (offset + 2 > bytes.length) return false;
    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return false;

    if (frameMarkers.has(marker)) {
      if (segmentLength < 7) return false;
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      return width === 512 && height === 512;
    }

    offset += segmentLength;
  }

  return false;
}

function decodeAvatar(value: unknown): Buffer | null {
  if (
    typeof value !== "string" ||
    !value.startsWith(PROFILE_AVATAR_DATA_URL_PREFIX)
  ) {
    return null;
  }

  const encoded = value.slice(PROFILE_AVATAR_DATA_URL_PREFIX.length);
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return null;

  const bytes = Buffer.from(encoded, "base64");
  if (
    bytes.length < 4 ||
    bytes.length > 512 * 1024 ||
    bytes.toString("base64") !== encoded ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes[2] !== 0xff ||
    bytes[bytes.length - 2] !== 0xff ||
    bytes[bytes.length - 1] !== 0xd9 ||
    !is512PixelJpeg(bytes)
  ) {
    return null;
  }
  return bytes;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "The compressed photo is too large." }, { status: 413 });
  }

  try {
    const bodyBytes = await readRequestBody(request);
    if (!bodyBytes) {
      return NextResponse.json({ error: "The compressed photo is too large." }, { status: 413 });
    }
    const bodyText = new TextDecoder().decode(bodyBytes);

    let payload: unknown;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: "Invalid photo upload." }, { status: 400 });
    }

    const image = payload && typeof payload === "object" && "image" in payload
      ? (payload as { image?: unknown }).image
      : undefined;
    if (typeof image !== "string" || !decodeAvatar(image)) {
      return NextResponse.json(
        { error: "Upload a valid cropped JPEG image smaller than 512 KB." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
      select: { id: true },
    });

    return NextResponse.json({ avatarUrl: PROFILE_AVATAR_ENDPOINT });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Your account could not be found. Sign in again before saving a photo." },
        { status: 404 }
      );
    }
    console.error("Profile photo upload failed", error);
    return NextResponse.json(
      { error: "Unable to save your photo. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Authentication is required.", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });
    const bytes = decodeAvatar(user?.image);
    if (!bytes) return new Response(null, { status: 404 });

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Profile photo read failed", error);
    return new Response("Unable to load the profile photo.", { status: 500 });
  }
}
