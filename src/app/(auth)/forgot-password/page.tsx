"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setDevResetUrl(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json() as { error?: string; message?: string; devResetUrl?: string };
      if (!response.ok) throw new Error(payload.error || "We could not start password recovery. Try again.");
      setSent(true);
      setDevResetUrl(payload.devResetUrl || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not start password recovery. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
            {sent ? <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" /> : <Mail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Forgot your password?</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {sent ? "If an account uses that address, password reset instructions are on their way." : "Enter the email address for your AgriVision.AI account."}
          </p>
        </div>

        {!sent && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="reset-email">
              Email address
              <Input id="reset-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </label>
            {error && <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={busy} aria-busy={busy}>
              {busy ? "Sending reset link…" : "Send reset link"}
            </Button>
          </form>
        )}

        {sent && devResetUrl && (
          <div role="status" className="space-y-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            <p>Local development mode: no email service is configured.</p>
            <Link className="break-all font-semibold underline" href={devResetUrl}>Open your password reset link</Link>
          </div>
        )}

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400">
          <ArrowLeft className="h-4 w-4" /> Return to sign in
        </Link>
      </div>
    </div>
  );
}
