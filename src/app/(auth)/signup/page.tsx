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
  User,
  Phone,
  Globe,
  Tractor,
  Shield,
  Crown,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

const ROLES = [
  {
    value: "farmer" as const,
    label: "Farmer",
    description: "Manage your farms and crops",
    icon: Tractor,
  },
  {
    value: "agriculture_officer" as const,
    label: "Agriculture Officer",
    description: "Monitor and guide farmers",
    icon: Shield,
  },
  {
    value: "admin" as const,
    label: "Admin",
    description: "Platform administration",
    icon: Crown,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { createAccount } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"farmer" | "agriculture_officer" | "admin">("farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      createAccount({
        name: fullName || "Farmer",
        email: email || "farmer@agrivision.ai",
        phone: phone || "+91 9880651312",
        role: selectedRole,
      });

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
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight dark:text-white">
            Create Your Account
          </h1>
          <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
            Join the smart farming revolution
          </p>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#008631]/10 border border-[#00ab41] rounded-xl flex items-center gap-2 text-xs font-bold text-[#00ab41] animate-fade-in">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Account created successfully! Redirecting to Dashboard...
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6">
          <label className="text-xs font-bold text-zinc-700 mb-2 block dark:text-zinc-300">
            I am a
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all cursor-pointer",
                    isSelected
                      ? "border-[#00ab41] bg-[#008631]/10 dark:bg-[#00ab41]/15"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isSelected ? "text-[#00ab41]" : "text-zinc-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold leading-tight",
                      isSelected ? "text-[#00ab41]" : "text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    {role.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
              Full Name
            </label>
            <Input
              type="text"
              required
              placeholder="Shashank"
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
              placeholder="gsshashank.hvr@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 mb-1.5 block dark:text-zinc-300">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="9880651312"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="h-4 w-4" />}
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
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
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
            createAccount({
              name: fullName || "Google Farmer",
              email: email || "user@gmail.com",
              role: selectedRole,
            });
            router.push("/dashboard");
          }}
        >
          <Globe className="h-5 w-5 text-[#00ab41]" />
          Sign up with Google
        </Button>

        {/* Login link */}
        <p className="text-center text-xs text-zinc-500 mt-6 dark:text-zinc-400">
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
