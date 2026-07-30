"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Shield, Crown, Save } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_USER } from "@/lib/mock-data";

export default function ProfilePage() {
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
          <Avatar
            src={MOCK_USER.avatar}
            alt={MOCK_USER.name}
            fallback="RP"
            size="lg"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {MOCK_USER.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
                {MOCK_USER.role}
              </span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 dark:bg-amber-950 dark:text-amber-300">
                <Crown className="h-3 w-3" /> {MOCK_USER.subscription}
              </span>
            </div>
          </div>
        </div>

        {/* Edit fields */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Full Name
            </label>
            <Input defaultValue={MOCK_USER.name} icon={<User className="h-4 w-4" />} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Email Address
            </label>
            <Input defaultValue="ramesh.patel@agrivision.ai" icon={<Mail className="h-4 w-4" />} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Phone Number
            </label>
            <Input defaultValue="+91 98765 43210" icon={<Phone className="h-4 w-4" />} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
              Primary Location
            </label>
            <Input defaultValue={MOCK_USER.location} icon={<MapPin className="h-4 w-4" />} />
          </div>

          <Button className="w-full" size="lg">
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
