"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Globe,
  Tractor,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { getProviders, getSession, signIn } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

export default function SignupPage() {
  const setUser = useAuthStore((state) => state.setUser);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    getProviders()
      .then((providers) => {
        if (active) setGoogleAvailable(Boolean(providers?.google));
      })
      .catch(() => {
        if (active) setGoogleAvailable(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          password,
          role: "FARMER",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const authResult = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!authResult?.ok || authResult.error) {
        setIsLoading(false);
        setErrorMsg("Your account was created, but automatic sign-in failed. Please sign in with your new account.");
        return;
      }

      const session = await getSession();
      const authenticatedUser = session?.user;
      if (!authenticatedUser?.id) {
        setIsLoading(false);
        setErrorMsg("Your account was created, but your session could not be loaded. Please sign in.");
        return;
      }

      setUser({
        uid: authenticatedUser.id,
        name: authenticatedUser.name || fullName,
        email: authenticatedUser.email || email,
        phone: authenticatedUser.phone || phone,
        role: authenticatedUser.role === "ADMIN" ? "admin" : "farmer",
        avatar: authenticatedUser.image || undefined,
        location: authenticatedUser.location || "GPS Location Active",
        subscription: authenticatedUser.subscription || "FREE",
      });

      setIsLoading(false);
      setSuccessMessage(true);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 600);
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMsg(err instanceof Error ? err.message : "Unable to register. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white dark:bg-black rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-2 sm:mb-3">
            <Tractor className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight dark:text-white">
            Create Farmer Account
          </h1>
          <p className="text-xs text-zinc-600 mt-1 dark:text-zinc-400 font-medium">
            Join the AgriVision.AI smart farming platform
          </p>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#008631]/10 border border-[#00ab41] rounded-xl flex items-center gap-2 text-xs font-bold text-[#00ab41] animate-fade-in">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Account created successfully! Redirecting to Dashboard...
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-600 animate-fade-in dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
              Full Name
            </label>
            <Input
              type="text"
              required
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
              Email Address
            </label>
            <Input
              type="email"
              required
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
              Phone Number
            </label>
            <PhoneNumberInput
              id="signup-phone"
              value={phone}
              onChange={setPhone}
              placeholder="Mobile number"
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
                placeholder="Enter password"
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

          <Button
            type="submit"
            className="w-full font-bold cursor-pointer min-h-[44px]"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4 sm:my-6">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-500 font-medium dark:text-zinc-400">or</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Google SSO */}
        <Button
          type="button"
          variant="outline"
          className="w-full font-bold cursor-pointer min-h-[44px]"
          size="lg"
          disabled={googleAvailable !== true || isLoading}
          onClick={async () => {
            if (googleAvailable !== true) {
              setErrorMsg("Google sign-in is not configured. Add a valid Google OAuth Web client ID and secret, then restart the app.");
              return;
            }
            setIsLoading(true);
            setErrorMsg(null);
            try {
              await signIn("google", { redirectTo: "/dashboard" });
            } catch {
              setIsLoading(false);
              setErrorMsg("Google sign-up could not be started. Check the Google OAuth Web client configuration.");
            }
          }}
        >
          <Globe className="h-5 w-5 text-[#00ab41]" />
          {googleAvailable === null
            ? "Checking Google sign-in…"
            : googleAvailable
              ? "Sign up with Google"
              : "Google sign-in not configured"}
        </Button>
        {googleAvailable === false && (
          <p className="mt-2 text-center text-[11px] text-amber-700 dark:text-amber-300">
            Configure a real Google OAuth Web client in <code>.env.local</code> to enable this option.
          </p>
        )}

        {/* Login link */}
        <p className="text-center text-xs text-zinc-600 mt-4 sm:mt-6 dark:text-zinc-400 font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#00ab41] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
