"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4 dark:bg-emerald-900">
            <Mail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Reset Password
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto dark:text-slate-400">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="farmer@agrivision.ai"
              icon={<Mail className="h-4 w-4" />}
            />
          </div>

          <Button className="w-full" size="lg">
            Send Reset Link
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors dark:text-slate-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
