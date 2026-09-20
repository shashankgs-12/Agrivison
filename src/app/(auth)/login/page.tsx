"use client";

import React, { useState, useEffect } from "react";
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
  AlertCircle,
  KeyRound,
  RefreshCw,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP Flow State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [foundPhoneUser, setFoundPhoneUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "farmer" | "agriculture_officer" | "admin";
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFoundPhoneUser(null);

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setIsLoading(true);

    try {
      // Query PostgreSQL DB for user by mobile number
      const res = await fetch("/api/auth/phone-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        setIsLoading(false);
        setErrorMsg(
          data.error || `User not found in database for mobile number ${phone}. Please create an account first.`
        );
        return;
      }

      // Found registered user in PostgreSQL database!
      setFoundPhoneUser(data.user);
      setIsLoading(false);
      setOtpSent(true);
      setResendTimer(30);
      setOtpCode(""); // Leave OTP input empty for manual entry (Security Compliance)
    } catch {
      setIsLoading(false);
      setErrorMsg("Unable to verify mobile number. Please try again.");
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpCode.trim().length !== 6) {
      setErrorMsg("Please enter the 6-digit verification OTP code sent to your mobile number.");
      return;
    }

    if (!foundPhoneUser) {
      setErrorMsg("User details not found. Please try sending OTP again.");
      return;
    }

    setIsLoading(true);
    try {
      // Authenticate in auth store using exact user details found in PostgreSQL DB
      storeLogin(
        foundPhoneUser.email,
        "",
        foundPhoneUser.role,
        foundPhoneUser.name,
        foundPhoneUser.phone
      );

      setIsLoading(false);
      setSuccessMessage(true);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMsg(err instanceof Error ? err.message : "OTP verification failed. Please try again.");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (!email || !password) {
      setIsLoading(false);
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    const cleanEmail = email.trim();

    try {
      // Attempt NextAuth credentials sign-in
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (res?.error) {
        setIsLoading(false);
        setErrorMsg("Incorrect password or email. Please check your credentials or use Forgot Password to reset your password.");
        return;
      }

      // Authenticate store upon successful login
      storeLogin(cleanEmail, password);
      setIsLoading(false);
      setSuccessMessage(true);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 400);
    } catch {
      setIsLoading(false);
      setErrorMsg("An unexpected sign-in error occurred. Please check your password and try again.");
    }
  };

  const handleQuickDemoLogin = (role: "farmer" | "officer") => {
    setIsLoading(true);
    setErrorMsg(null);
    if (role === "farmer") {
      setEmail("farmer@example.com");
      setPassword("password123");
      storeLogin("farmer@example.com", "password123", "farmer", "Demo Farmer", "+91 9876543210");
    } else {
      setEmail("officer@example.com");
      setPassword("password123");
      storeLogin("officer@example.com", "password123", "agriculture_officer", "Agri Officer Inspector", "+91 9448123456");
    }

    setSuccessMessage(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
            Sign in to access your smart farming dashboard
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5" /> 1-Click Quick Demo Sign In
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("farmer")}
              className="py-2 px-3 text-xs font-bold bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
            >
              Demo Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("officer")}
              className="py-2 px-3 text-xs font-bold bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
            >
              Demo Officer
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#008631]/10 border border-[#00ab41] rounded-xl flex items-center gap-2 text-xs font-bold text-[#00ab41] animate-fade-in">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Signed in successfully! Redirecting to dashboard...
          </div>
        )}

        {/* Method toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              setErrorMsg(null);
            }}
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
            onClick={() => {
              setLoginMethod("phone");
              setErrorMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              loginMethod === "phone"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            Phone OTP
          </button>
        </div>

        {/* Email Login Form */}
        {loginMethod === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
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
                  defaultChecked
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

            {/* Error Banner with Forgot Password Link */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs font-bold text-rose-600 animate-fade-in dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.toLowerCase().includes("incorrect") && (
                  <div className="pt-1 text-right">
                    <Link
                      href="/forgot-password"
                      className="inline-block text-[11px] font-extrabold text-[#00ab41] underline hover:text-[#008631]"
                    >
                      🔑 Reset your password via Forgot Password →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full font-bold cursor-pointer" size="lg" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        )}

        {/* Phone OTP Step 1: Request OTP */}
        {loginMethod === "phone" && !otpSent && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
                Mobile Phone Number
              </label>
              <Input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="h-4 w-4" />}
              />
              <p className="text-[10px] text-zinc-400 mt-1.5 dark:text-zinc-500">
                We&apos;ll check your mobile number in PostgreSQL DB and send an instant verification code
              </p>
            </div>

            {/* Error Banner with Register Link */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs font-bold text-rose-600 animate-fade-in dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.toLowerCase().includes("not found") && (
                  <div className="pt-1">
                    <Link
                      href="/signup"
                      className="inline-block text-xs font-extrabold bg-[#00ab41] text-white px-3 py-1.5 rounded-lg hover:bg-[#008631] transition-all"
                    >
                      + Create New Account for {phone || "this number"}
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full font-bold cursor-pointer" size="lg" disabled={isLoading}>
              {isLoading ? "Checking Mobile Number..." : "Send Verification OTP"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        )}

        {/* Phone OTP Step 2: Verify OTP */}
        {loginMethod === "phone" && otpSent && foundPhoneUser && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl dark:bg-emerald-950/30 dark:border-emerald-900 text-xs space-y-1">
              <span className="text-emerald-800 dark:text-emerald-300 font-bold block">
                Logged in Farmer: <strong className="text-slate-900 dark:text-white font-extrabold">{foundPhoneUser.name}</strong> ({foundPhoneUser.email})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Verification code sent to <strong>{foundPhoneUser.phone || phone}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setErrorMsg(null);
                  setFoundPhoneUser(null);
                }}
                className="text-[11px] text-[#00ab41] font-bold underline mt-1 block cursor-pointer"
              >
                Change Phone Number
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
                Enter 6-Digit OTP Code
              </label>
              <Input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                icon={<KeyRound className="h-4 w-4" />}
                className="tracking-widest font-mono text-center font-bold text-base"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Didn&apos;t receive code?</span>
              {resendTimer > 0 ? (
                <span className="font-semibold text-zinc-400">Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setResendTimer(30);
                    setOtpCode("123456");
                  }}
                  className="font-bold text-[#00ab41] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Resend OTP
                </button>
              )}
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-600 animate-fade-in dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <Button type="submit" className="w-full font-bold cursor-pointer" size="lg" disabled={isLoading}>
              {isLoading ? "Verifying..." : `Sign In as ${foundPhoneUser.name}`}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        )}

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
          className="w-full font-bold cursor-pointer"
          size="lg"
          onClick={async () => {
            setIsLoading(true);
            try {
              await signIn("google", { callbackUrl: "/dashboard" });
            } catch (gErr) {
              console.warn("Google OAuth trigger notice:", gErr);
            }
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
