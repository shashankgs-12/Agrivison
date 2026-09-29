"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { User, Mail, Phone, MapPin, Crown, Save, CheckCircle2, LogOut, Camera, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import {
  cropAndCompressProfilePhoto,
  validateProfilePhotoFile,
} from "@/lib/profile-photo";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const { update } = useSession();

  const [name, setName] = useState(user?.name || "Farmer");
  const [phone, setPhone] = useState(user?.phone || "+91 9880651312");
  const [location, setLocation] = useState(user?.location || "Mandya District, KA");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSaved, setPhotoSaved] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const handlePhotoSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const validationError = validateProfilePhotoFile(file);
    if (validationError) {
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setPhotoError(validationError);
      setPhotoSaved(false);
      return;
    }

    setPhotoError(null);
    setPhotoSaved(false);
    setCropX(50);
    setCropY(50);
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSavePhoto = async () => {
    if (!photoFile) return;
    setIsSavingPhoto(true);
    setPhotoError(null);
    setPhotoSaved(false);

    try {
      const image = await cropAndCompressProfilePhoto(photoFile, { x: cropX, y: cropY });
      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        avatarUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.avatarUrl) {
        throw new Error(payload.error || "Unable to save your photo.");
      }

      let avatarUrl = payload.avatarUrl;
      try {
        const refreshedSession = await update({});
        if (refreshedSession?.user?.image) avatarUrl = refreshedSession.user.image;
      } catch {
        // The photo is already saved; the signed-in store below keeps it visible.
      }

      if (user) setUser({ ...user, avatar: avatarUrl });
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setPhotoSaved(true);
    } catch (cause) {
      setPhotoError(cause instanceof Error ? cause.message : "Unable to save your photo.");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavedSuccess(false);

    if (!user) {
      setErrorMessage("Sign in again before updating your profile.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, location }),
      });
      const data = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(data.error || "Unable to update your profile.");
      }

      setUser({
        ...user,
        name: data.user.name || name,
        phone: data.user.phone || "",
        location: data.user.location || "",
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    logout();
    try {
      await signOut({ callbackUrl: "/login", redirect: true });
    } catch {
      router.push("/login");
    }
  };

  const avatarUrl = user?.avatar;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
          User Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details and farming role
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        {/* Avatar header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <Avatar src={avatarUrl} alt={name} fallback={name.charAt(0)} size="lg" />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              <Camera className="h-3.5 w-3.5" /> {avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Choose a profile photo"
              onChange={handlePhotoSelection}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full capitalize dark:bg-emerald-950 dark:text-emerald-300">
                {user?.role || "farmer"}
              </span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 dark:bg-amber-950 dark:text-amber-300">
                <Crown className="h-3 w-3" /> {user?.subscription || "Free Plan"}
              </span>
            </div>
          </div>
        </div>

        {photoError && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            {photoError}
          </div>
        )}
        {photoSaved && (
          <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Profile photo saved and updated across your account.
          </div>
        )}
        {photoFile && photoPreviewUrl && (
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50" aria-label="Crop profile photo">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500 bg-slate-200 dark:bg-slate-800">
                {/* Local object URL preview; canvas compression happens before upload. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreviewUrl}
                  alt="Preview of the selected profile photo"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: `${cropX}% ${cropY}%` }}
                  onError={() => setPhotoError("The selected image could not be previewed. Choose another photo.")}
                />
              </div>
              <div className="min-w-[220px] flex-1 space-y-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Preview and crop</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Adjust the crop, then save your square profile photo.</p>
                </div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Horizontal crop
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropX}
                    onChange={(event) => setCropX(Number(event.target.value))}
                    className="mt-1 block w-full accent-emerald-600"
                    aria-label="Horizontal crop position"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Vertical crop
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropY}
                    onChange={(event) => setCropY(Number(event.target.value))}
                    className="mt-1 block w-full accent-emerald-600"
                    aria-label="Vertical crop position"
                  />
                </label>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSavingPhoto}
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreviewUrl(null);
                  setPhotoError(null);
                }}
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button type="button" disabled={isSavingPhoto} onClick={handleSavePhoto}>
                {isSavingPhoto ? "Saving photo…" : "Save photo"}
              </Button>
            </div>
          </section>
        )}

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}
        {errorMessage && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Edit fields */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Email Address
            </label>
            <Input
              value={user?.email || ""}
              readOnly
              aria-describedby="profile-email-help"
              icon={<Mail className="h-4 w-4" />}
            />
            <p id="profile-email-help" className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              Email address is managed by your sign-in provider.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Phone Number
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Primary Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              icon={<MapPin className="h-4 w-4" />}
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button type="submit" disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer" size="lg">
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving Profile..." : "Save Profile Changes"}
            </Button>

            <Button
              type="button"
              onClick={handleLogout}
              variant="outline"
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold cursor-pointer dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
              size="lg"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Log Out of AgriVision.AI
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

