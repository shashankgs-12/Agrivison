"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  Globe,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(email || "farmer@agrivision.ai");
      setIsLoading(false);
      setSuccessMessage(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    }, 400);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
            Sign in to access your farming dashboard
          </p>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#008631]/10 border border-[#00ab41] rounded-xl flex items-center gap-2 text-xs font-bold text-[#00ab41] animate-fade-in">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Signed in successfully! Redirecting...
          </div>
        )}

        {/* Method toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setLoginMethod("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              loginMethod === "email"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              loginMethod === "phone"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            Phone
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMethod === "email" ? (
            <>
              <div>
                <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="farmer@agrivision.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4" />}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-[#00ab41] focus:ring-[#00ab41]"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#00ab41] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
                Phone Number
              </label>
              <Input
                type="tel"
                required
                placeholder="+91 9880651312"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="h-4 w-4" />}
              />
              <p className="text-[10px] text-zinc-400 mt-1.5 dark:text-zinc-500">
                We&apos;ll send you a one-time verification code
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Signing In..." : loginMethod === "email" ? "Sign In" : "Send OTP"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-400 font-medium">or</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Google SSO */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          onClick={() => {
            login(email || "google@agrivision.ai");
            router.push("/dashboard");
          }}
        >
          <Globe className="h-5 w-5 text-[#00ab41]" />
          Continue with Google
        </Button>

        {/* Sign up link */}
        <p className="text-center text-xs text-zinc-500 mt-6 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-[#00ab41] hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
