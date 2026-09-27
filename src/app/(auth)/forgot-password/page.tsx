"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
            <Mail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Reset Password
          </h1>
        </div>

        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          Password recovery is unavailable because this deployment has no reset-email service configured. No recovery email has been sent and no password has been changed.
        </div>

        <Link href="/login" className="block">
          <Button className="w-full" size="lg">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Return to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
