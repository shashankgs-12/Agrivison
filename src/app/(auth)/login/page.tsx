"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProviders, getSession, signIn } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
} from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { auth as firebaseAuth, isFirebasePhoneAuthConfigured } from "@/lib/firebase/config";

export default function LoginPage() {
  const setUser = useAuthStore((state) => state.setUser);

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

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
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const syncUserFromSession = async (): Promise<{
    requiresProfileCompletion: boolean;
  } | null> => {
    const session = await getSession();
    const authenticatedUser = session?.user;

    if (!authenticatedUser?.id) {
      return null;
    }

    setUser({
      uid: authenticatedUser.id,
      name: authenticatedUser.name || "Farmer",
      email: authenticatedUser.email || "",
      phone: authenticatedUser.phone || "",
      role: authenticatedUser.role === "ADMIN" ? "admin" : "farmer",
      avatar: authenticatedUser.image || undefined,
      location: authenticatedUser.location || "GPS Location Active",
      subscription: authenticatedUser.subscription || "FREE",
    });

    return {
      requiresProfileCompletion: authenticatedUser.requiresProfileCompletion,
    };
  };

  const handleSendPhoneCode = async () => {
    setErrorMsg(null);

    if (!isFirebasePhoneAuthConfigured) {
      setErrorMsg(
        "Phone OTP is not configured yet. Add this app's Firebase web settings and enable Phone sign-in in Firebase Authentication."
      );
      return;
    }

    const normalizedPhone = phoneNumber.replace(/[\s()-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setErrorMsg("Enter your mobile number with its country code, such as +91 9876543210.");
      return;
    }
    if (!smsConsent) {
      setErrorMsg("Please agree to receive one SMS verification code before continuing.");
      return;
    }
    if (!recaptchaContainerRef.current) {
      setErrorMsg("The verification widget could not be loaded. Refresh the page and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const verifier =
        recaptchaVerifierRef.current ??
        new RecaptchaVerifier(firebaseAuth, recaptchaContainerRef.current, {
          size: "normal",
        });
      recaptchaVerifierRef.current = verifier;

      confirmationResultRef.current = await signInWithPhoneNumber(
        firebaseAuth,
        normalizedPhone,
        verifier
      );
      setPhoneNumber(normalizedPhone);
      setPhoneCodeSent(true);
      setVerificationCode("");
      setErrorMsg(null);
    } catch (cause) {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      const code =
        cause && typeof cause === "object" && "code" in cause
          ? String(cause.code)
          : "";
      if (code === "auth/unauthorized-domain") {
        setErrorMsg("This domain is not authorized for Firebase phone sign-in. Add it in Firebase Authentication settings.");
      } else if (code === "auth/operation-not-allowed") {
        setErrorMsg("Phone sign-in is disabled for this Firebase project. Enable the Phone provider in Firebase Authentication.");
      } else if (code === "auth/too-many-requests" || code === "auth/quota-exceeded") {
        setErrorMsg("Firebase temporarily limited SMS requests. Wait a while or use a Firebase test phone number.");
      } else {
        setErrorMsg("Could not send the verification code. Check the phone number, reCAPTCHA, and Firebase SMS settings, then try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    if (!confirmationResultRef.current) {
      setErrorMsg("Request a verification code first.");
      return;
    }
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setErrorMsg("Enter the 6-digit code sent to your mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const firebaseUser = (await confirmationResultRef.current.confirm(verificationCode.trim())).user;
      const idToken = await firebaseUser.getIdToken(true);
      const result = await signIn("firebase-phone", {
        idToken,
        redirect: false,
      });
      const syncedSession = await syncUserFromSession();

      if (!result?.ok || result.error || !syncedSession) {
        throw new Error(
          "The code was verified, but the AgriVision session could not be created. Check the Firebase project settings and try again."
        );
      }

      await firebaseSignOut(firebaseAuth).catch(() => undefined);
      window.location.replace(
        syncedSession.requiresProfileCompletion ? "/complete-profile" : "/dashboard"
      );
    } catch (cause) {
      const code =
        cause && typeof cause === "object" && "code" in cause
          ? String(cause.code)
          : "";
      if (code === "auth/invalid-verification-code") {
        setErrorMsg("That verification code is incorrect. Check the SMS and try again.");
      } else if (code === "auth/code-expired") {
        setErrorMsg("That verification code expired. Request a new code and try again.");
      } else {
        setErrorMsg(cause instanceof Error ? cause.message : "Phone sign-in failed. Please try again.");
      }
      await firebaseSignOut(firebaseAuth).catch(() => undefined);
    } finally {
      setIsLoading(false);
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

    const cleanEmail = email.trim().toLowerCase();

    try {
      // Attempt NextAuth credentials sign-in
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (!res?.ok || res.error) {
        setIsLoading(false);
        setErrorMsg("Incorrect password or email. Please check your credentials or use Forgot Password to reset your password.");
        return;
      }

      const syncedSession = await syncUserFromSession();
      if (!syncedSession) {
        setIsLoading(false);
        setErrorMsg("Sign-in completed, but your session could not be loaded. Please try again.");
        return;
      }

      setIsLoading(false);
      setSuccessMessage(true);

      setTimeout(() => {
        window.location.replace(
          syncedSession.requiresProfileCompletion ? "/complete-profile" : "/dashboard"
        );
      }, 400);
    } catch {
      setIsLoading(false);
      setErrorMsg("An unexpected sign-in error occurred. Please check your password and try again.");
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const demoEmail = "farmer@agrivision.ai";
    const demoPass = "password123";
    setEmail(demoEmail);
    setPassword(demoPass);

    try {
      // Sync NextAuth credentials session
      const result = await signIn("credentials", {
        email: demoEmail,
        password: demoPass,
        redirect: false,
      });
      const syncedSession = await syncUserFromSession();
      if (!result?.ok || result.error || !syncedSession) {
        setIsLoading(false);
        setErrorMsg("Demo sign-in is unavailable. Please sign in with a registered account.");
        return;
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Demo sign-in is unavailable. Please sign in with a registered account.");
      return;
    }

    setIsLoading(false);
    setSuccessMessage(true);
    setTimeout(() => {
      window.location.replace("/dashboard");
    }, 400);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white dark:bg-black rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-zinc-600 mt-1 dark:text-zinc-400 font-medium">
            Sign in to access your smart farming dashboard
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5" /> 1-Click Quick Demo Sign In
          </div>
          <div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full min-h-[44px] py-2 px-3 text-xs font-bold bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              Demo Farmer Sign In
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
        <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              setErrorMsg(null);
              setSuccessMessage(false);
              confirmationResultRef.current = null;
              recaptchaVerifierRef.current?.clear();
              recaptchaVerifierRef.current = null;
              setPhoneCodeSent(false);
              setVerificationCode("");
            }}
            className={`flex-1 min-h-[40px] flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              loginMethod === "email"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
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
              setSuccessMessage(false);
            }}
            className={`flex-1 min-h-[40px] flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              loginMethod === "phone"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
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

        {loginMethod === "phone" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Mobile number
              </label>
              <Input
                type="tel"
                autoComplete="tel"
                placeholder="+91 9876543210"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                disabled={phoneCodeSent || isLoading}
                icon={<Phone className="h-4 w-4" />}
              />
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Include your country calling code.
              </p>
            </div>

            {!isFirebasePhoneAuthConfigured && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                Add the Firebase web configuration to <code>.env.local</code> and enable Phone sign-in in Firebase Authentication to send real SMS codes.
              </div>
            )}

            <label className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(event) => setSmsConsent(event.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-300 text-[#00ab41] focus:ring-[#00ab41]"
              />
              <span>
                I agree to receive one SMS verification code. Standard message rates may apply.
              </span>
            </label>

            <div ref={recaptchaContainerRef} />

            {!phoneCodeSent ? (
              <Button
                type="button"
                onClick={handleSendPhoneCode}
                disabled={isLoading}
                className="w-full font-bold"
                size="lg"
              >
                {isLoading ? "Sending code…" : "Send verification code"}
              </Button>
            ) : (
              <form onSubmit={handleVerifyPhoneCode} className="space-y-3">
                <p
                  className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                  role="status"
                >
                  Verification code sent to {phoneNumber}. Enter the 6-digit code below and select Verify to sign in.
                </p>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    6-digit verification code
                  </label>
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    placeholder="Enter code from SMS"
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    icon={<Lock className="h-4 w-4" />}
                  />
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Code sent to {phoneNumber}.
                  </p>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full font-bold" size="lg">
                  {isLoading ? "Verifying…" : "Verify code and sign in"}
                </Button>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleSendPhoneCode}
                    disabled={isLoading}
                    className="font-semibold text-[#00ab41] hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      confirmationResultRef.current = null;
                      recaptchaVerifierRef.current?.clear();
                      recaptchaVerifierRef.current = null;
                      setPhoneCodeSent(false);
                      setVerificationCode("");
                      setErrorMsg(null);
                    }}
                    disabled={isLoading}
                    className="font-semibold text-zinc-500 hover:underline disabled:opacity-50"
                  >
                    Change number
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

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
            } catch (gErr) {
              console.warn("Google OAuth trigger notice:", gErr);
              setIsLoading(false);
              setErrorMsg("Google sign-in could not be started. Check the Google OAuth Web client configuration.");
            }
          }}
        >
          <Globe className="h-5 w-5 text-[#00ab41]" />
          {googleAvailable === null
            ? "Checking Google sign-in…"
            : googleAvailable
              ? "Continue with Google"
              : "Google sign-in not configured"}
        </Button>
        {googleAvailable === false && (
          <p className="mt-2 text-center text-[11px] text-amber-700 dark:text-amber-300">
            Configure a real Google OAuth Web client in <code>.env.local</code> to enable this option.
          </p>
        )}

        {/* Sign up link */}
        <p className="text-center text-xs text-zinc-600 mt-4 sm:mt-6 dark:text-zinc-400 font-medium">
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
