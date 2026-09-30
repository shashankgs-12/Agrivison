"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

export type GoogleProviderStatus =
  | "checking"
  | "available"
  | "unavailable"
  | "timed-out";

const GOOGLE_PROVIDER_CHECK_TIMEOUT_MS = 5_000;
const GOOGLE_SIGN_IN_START_TIMEOUT_MS = 12_000;

/** A provider discovery failure must never hold the rest of the auth UI hostage. */
export function useGoogleProviderStatus(): GoogleProviderStatus {
  const [status, setStatus] = useState<GoogleProviderStatus>("checking");

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (active) setStatus("timed-out");
    }, GOOGLE_PROVIDER_CHECK_TIMEOUT_MS);

    getProviders()
      .then((providers) => {
        if (!active) return;
        window.clearTimeout(timeoutId);
        setStatus(providers?.google ? "available" : "unavailable");
      })
      .catch(() => {
        if (!active) return;
        window.clearTimeout(timeoutId);
        setStatus("unavailable");
      });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return status;
}

export type GoogleSignInStart =
  | { ok: true; url: string }
  | { ok: false; reason: "timeout" | "unavailable" | "error" };

/** Start Auth.js Google OAuth without letting a stalled request lock its button. */
export async function startGoogleSignIn(): Promise<GoogleSignInStart> {
  let timeoutId: number | undefined;

  try {
    const outcome = await Promise.race([
      signIn("google", { redirect: false, redirectTo: "/dashboard" }).then(
        (response) => ({ type: "response" as const, response }),
        () => ({ type: "error" as const })
      ),
      new Promise<{ type: "timeout" }>((resolve) => {
        timeoutId = window.setTimeout(
          () => resolve({ type: "timeout" }),
          GOOGLE_SIGN_IN_START_TIMEOUT_MS
        );
      }),
    ]);

    if (outcome.type === "timeout") return { ok: false, reason: "timeout" };
    if (outcome.type === "error") return { ok: false, reason: "error" };
    if (!outcome.response?.url || outcome.response.error) {
      return { ok: false, reason: "unavailable" };
    }

    return { ok: true, url: outcome.response.url };
  } catch {
    return { ok: false, reason: "error" };
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}
