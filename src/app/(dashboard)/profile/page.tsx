"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Crown, Save, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || "Farmer");
  const [email, setEmail] = useState(user?.email || "farmer@agrivision.ai");
  const [phone, setPhone] = useState(user?.phone || "+91 9880651312");
  const [location, setLocation] = useState(user?.location || "Mandya District, KA");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({
        ...user,
        name,
        email,
        phone,
        location,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

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
          <Avatar src={avatarUrl} alt={name} fallback={name.charAt(0)} size="lg" />
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

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Profile updated successfully!</span>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
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

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold" size="lg">
            <Save className="h-4 w-4 mr-1" />
            Save Profile Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
