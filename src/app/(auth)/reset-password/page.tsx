"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function passwordStrength(value: string) {
  if (!value) return 0;
  return [value.length >= 12, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
}

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const strength = useMemo(() => passwordStrength(password), [password]);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  useEffect(() => {
    if (!complete) return;
    const timer = window.setTimeout(() => window.location.assign("/login?passwordReset=success"), 1800);
    return () => window.clearTimeout(timer);
  }, [complete]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("This reset link is missing its security token. Request a new reset link.");
      return;
    }
    if (password.length < 12) {
      setError("Choose a password with at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(payload.error || "This reset link is invalid or expired. Request a new one.");
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Password could not be updated. Request a new reset link.");
    } finally {
      setBusy(false);
    }
  }

  const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Very strong"][strength];

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
            {complete ? <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" /> : <LockKeyhole className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Choose a new password</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {complete ? "Your password has been updated. Taking you to sign in…" : "Create a strong password for your account."}
          </p>
        </div>

        {!complete && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="new-password">
              New password
              <span className="relative block">
                <Input id="new-password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" className="pr-12" />
                <button type="button" onClick={() => setVisible((current) => !current)} className="absolute inset-y-0 right-3 flex items-center text-slate-500" aria-label={visible ? "Hide password" : "Show password"}>
                  {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>
            <div aria-live="polite" className="space-y-1">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((bar) => <span key={bar} className={`h-1.5 flex-1 rounded-full ${strength >= bar ? strength >= 4 ? "bg-emerald-500" : strength >= 3 ? "bg-lime-500" : "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"}`} />)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Password strength: {strengthLabel}. Use 12+ characters with mixed case, numbers, and symbols.</p>
            </div>
            <label className="block space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="confirm-password">
              Confirm password
              <Input id="confirm-password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter the password again" />
            </label>
            {error && <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={busy || !token} aria-busy={busy}>
              {busy ? "Updating password…" : "Update password"}
            </Button>
          </form>
        )}

        {!complete && !token && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">This link is missing a reset token. Request a new password reset link.</p>}
        <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400">
          <ArrowLeft className="h-4 w-4" /> Return to sign in
        </Link>
      </div>
    </div>
  );
}
