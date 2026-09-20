"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 dark:bg-slate-900 dark:border-slate-800">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4 dark:bg-emerald-950/50">
            <Mail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Reset Password
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto dark:text-slate-400">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-5 text-center animate-fade-in">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 space-y-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
              <p className="text-sm font-extrabold">Reset Instructions Sent!</p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                We sent password recovery instructions to <strong className="font-bold text-slate-900 dark:text-white">{email}</strong>. Please check your email inbox.
              </p>
            </div>

            <Link href="/login">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer" size="lg">
                Return to Sign In
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
                Registered Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="varun@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-600 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer" size="lg" disabled={isLoading}>
              {isLoading ? "Sending Link..." : "Send Reset Link"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        )}

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors dark:text-slate-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

