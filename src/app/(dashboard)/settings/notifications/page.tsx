"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Smartphone,
  MessageSquare,
  ShieldAlert,
  CloudSun,
  Droplets,
  Sprout,
  CheckCircle2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationSettingsPage() {
  const [channels, setChannels] = useState({
    push: true,
    sms: true,
    whatsapp: false,
  });

  const [alerts, setAlerts] = useState({
    disease: true,
    weather: true,
    irrigation: true,
    harvest: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Notification & Alert Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure how and when you receive critical farm advisories
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Notification preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Delivery Channels */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Delivery Channels
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">In-App & Push Notifications</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant alerts when app is active or in background</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.push}
                onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">SMS Mobile Alerts</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct SMS messages for severe weather & crop disease outbreaks</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.sms}
                onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Advisory Digest</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily morning summary sent to registered phone number</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.whatsapp}
                onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Alert Types */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Subscribed Advisory Topics
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Crop Disease Outbreak Warnings</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Immediate alerts when regional disease risks detected nearby</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={alerts.disease}
                onChange={(e) => setAlerts({ ...alerts, disease: e.target.checked })}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <CloudSun className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Extreme Weather & Rain Alerts</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Heavy rainfall, storm, or heatwave warnings</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={alerts.weather}
                onChange={(e) => setAlerts({ ...alerts, weather: e.target.checked })}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Droplets className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Smart Irrigation Reminders</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Soil moisture threshold & water conservation hold advice</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={alerts.irrigation}
                onChange={(e) => setAlerts({ ...alerts, irrigation: e.target.checked })}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold" size="lg">
          <Save className="h-4 w-4 mr-2" /> Save Notification Preferences
        </Button>
      </form>
    </div>
  );
}

