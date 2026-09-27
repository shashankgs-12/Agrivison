import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Phone sign-in is unavailable because no SMS verification provider is configured.",
    },
    { status: 501 }
  );
}
