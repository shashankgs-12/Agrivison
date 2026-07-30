"use client";

import React from "react";
import Link from "next/link";
import {
  Sprout,
  Scan,
  Sparkles,
  CloudSun,
  Droplets,
  MapPin,
  Globe,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Star,
  Crown,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FEATURES = [
  {
    icon: Scan,
    title: "AI Disease Detection",
    description:
      "Upload a photo of your crop and get instant disease diagnosis with treatment recommendations powered by Gemini AI.",
    color: "from-rose-500 to-red-600",
    shadow: "shadow-rose-500/20",
  },
  {
    icon: Sparkles,
    title: "Plant Identification",
    description:
      "Identify any plant instantly. Get detailed growing information, fertilizer needs, and seasonal advice in your language.",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: MapPin,
    title: "GPS Farm Mapping",
    description:
      "Walk around your farm to map boundaries or draw on satellite view. Calculate exact area and manage multiple fields.",
    color: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: CloudSun,
    title: "Weather Intelligence",
    description:
      "Hyper-local weather forecasts with rain predictions, severe weather alerts, and automated irrigation scheduling.",
    color: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-500/20",
  },
  {
    icon: Droplets,
    title: "Smart Irrigation",
    description:
      "AI-powered irrigation advisor that combines weather data, soil moisture, and crop stage for optimal water management.",
    color: "from-cyan-500 to-teal-600",
    shadow: "shadow-cyan-500/20",
  },
  {
    icon: Globe,
    title: "6 Indian Languages",
    description:
      "Full multilingual support — English, Kannada, Hindi, Telugu, Tamil, and Malayalam with per-module language selection.",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
];

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    role: "Farmer, Mandya",
    quote:
      "AgriVision detected Yellow Rust in my wheat before I could even see it. The Kannada language support makes it so easy to use.",
    rating: 5,
  },
  {
    name: "Priya Devi",
    role: "Agriculture Officer",
    quote:
      "I manage 200+ farmers now. The GPS mapping and disease alerts save me hours of field visits every week.",
    rating: 5,
  },
  {
    name: "Mohammed Ismail",
    role: "Farmer, Raichur",
    quote:
      "The irrigation advisor told me not to water when rain was expected. I saved 14,000 liters that day alone!",
    rating: 5,
  },
];

const PRICING = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "1 Farm",
      "5 Disease scans/month",
      "Basic weather",
      "English only",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Premium",
    price: "₹299",
    period: "/month",
    features: [
      "Unlimited Farms",
      "Unlimited AI scans",
      "Hyper-local weather",
      "6 languages",
      "Smart irrigation",
      "Priority support",
      "Offline mode",
    ],
    cta: "Start Premium Trial",
    popular: true,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ========= NAVBAR ========= */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-50 dark:bg-slate-950/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">
              AgriVision<span className="text-emerald-600">.AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors dark:text-slate-300">
              Features
            </a>
            <a href="#testimonials" className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors dark:text-slate-300">
              Testimonials
            </a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors dark:text-slate-300">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors dark:text-slate-300"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ========= HERO ========= */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-100 via-green-50 to-sky-100 blur-3xl opacity-50 pointer-events-none dark:from-emerald-900/20 dark:via-green-900/10 dark:to-sky-900/10" />
        <div className="absolute top-40 -left-20 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none dark:bg-emerald-800/10" />
        <div className="absolute top-60 -right-20 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl pointer-events-none dark:bg-sky-800/10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-6 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
            <Zap className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 dark:text-white">
            One Platform for{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Smart Farming
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed dark:text-slate-400">
            AI-powered crop intelligence, GPS farm mapping, weather forecasting,
            disease detection, and multilingual support — everything a modern
            farmer needs in a single premium dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              Start Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold bg-white text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm dark:bg-slate-900 dark:text-white dark:border-slate-800 dark:hover:bg-slate-800"
            >
              View Demo
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-10 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-emerald-600" /> Secure & Private
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="h-4 w-4 text-emerald-600" /> Works Offline
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-emerald-600" /> 6 Languages
            </span>
          </div>
        </div>
      </section>

      {/* ========= FEATURES ========= */}
      <section id="features" className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight dark:text-white">
              Everything Your Farm Needs
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto dark:text-slate-400">
              From AI disease detection to smart irrigation — powered by Google
              Gemini and built for Indian farmers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group dark:bg-slate-900 dark:border-slate-800"
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md mb-4 transition-transform group-hover:scale-110",
                      feature.color,
                      feature.shadow
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========= TESTIMONIALS ========= */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight dark:text-white">
              Trusted by Farmers Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg transition-all dark:bg-slate-900 dark:border-slate-800"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 italic dark:text-slate-400">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm dark:bg-emerald-900 dark:text-emerald-300">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= PRICING ========= */}
      <section id="pricing" className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight dark:text-white">
              Simple, Farmer-Friendly Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border p-6 relative transition-all hover:shadow-lg",
                  plan.popular
                    ? "bg-white border-emerald-300 shadow-md ring-2 ring-emerald-500 dark:bg-slate-900 dark:border-emerald-600"
                    : "bg-white border-slate-200/80 dark:bg-slate-900 dark:border-slate-800"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 bg-emerald-600 text-white rounded-full shadow-sm">
                      <Crown className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-bold text-slate-900 mb-1 dark:text-white">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={cn(
                    "block w-full text-center py-2.5 rounded-lg font-bold text-sm transition-colors",
                    plan.popular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= CTA ========= */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 relative z-10">
              Ready to Farm Smarter?
            </h2>
            <p className="text-emerald-100 mb-8 max-w-lg mx-auto relative z-10">
              Join thousands of Indian farmers already using AI to increase
              yields, save water, and protect crops from disease.
            </p>
            <Link
              href="/signup"
              className="relative z-10 inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold bg-white text-emerald-800 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========= FOOTER ========= */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white">
              <Sprout className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              AgriVision<span className="text-emerald-600">.AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 AgriVision AI. Built with ❤️ for Indian Farmers.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
