"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const phoneVerified = session?.user?.authProvider === "firebase-phone";
  const nameValue = name ?? session?.user?.name ?? "";
  const phoneValue = phone ?? session?.user?.phone ?? "";
  const locationValue = location ?? session?.user?.location ?? "";

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [router, status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanName = nameValue.trim();
    const cleanPhone = phoneValue.replace(/[\s()-]/g, "");
    const cleanLocation = locationValue.trim();

    if (cleanName.length < 2) {
      setError("Enter your name using at least 2 characters.");
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(cleanPhone)) {
      setError("Enter your mobile number with its country code, such as +91 9876543210.");
      return;
    }
    if (cleanLocation.length < 2) {
      setError("Enter your village, district, or nearest town.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          location: cleanLocation,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save your profile.");
      }

      // Passing data (even an empty object) makes Auth.js run the JWT update
      // callback, which reloads the just-saved profile from PostgreSQL.
      const refreshedSession = await update({});
      if (!refreshedSession?.user || refreshedSession.user.requiresProfileCompletion) {
        throw new Error(
          "Your profile was saved, but your session did not refresh. Please try saving again."
        );
      }

      // A full navigation makes the server layout read the refreshed session cookie.
      window.location.replace("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-4">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          One last step
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Complete your farmer profile
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Add your contact number and farm location so AgriVision can personalize local crop and weather information. All three fields are required before dashboard pages unlock.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"
      >
        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold">
            Full name
          </label>
          <Input
            id="profile-name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            value={nameValue}
            onChange={(event) => setName(event.target.value)}
            icon={<UserRound className="h-4 w-4" />}
          />
        </div>

        <div>
          <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-semibold">
            Mobile number
          </label>
          <PhoneNumberInput
            id="profile-phone"
            required
            placeholder="Mobile number"
            value={phoneValue}
            onChange={setPhone}
            disabled={phoneVerified}
          />
          <p className="mt-1 text-xs text-slate-500">
            {phoneVerified
              ? "This number was verified with SMS."
              : "Select your country, then enter your mobile number."}
          </p>
        </div>

        <div>
          <label htmlFor="profile-location" className="mb-1.5 block text-sm font-semibold">
            Farm location
          </label>
          <Input
            id="profile-location"
            autoComplete="address-level2"
            required
            minLength={2}
            maxLength={160}
            placeholder="Village, district, or nearest town"
            value={locationValue}
            onChange={(event) => setLocation(event.target.value)}
            icon={<MapPin className="h-4 w-4" />}
          />
        </div>

        {error && (
          <p
            className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={saving || status === "loading"}>
          {saving ? "Saving profile…" : "Save and continue"}
        </Button>
      </form>
    </div>
  );
}
