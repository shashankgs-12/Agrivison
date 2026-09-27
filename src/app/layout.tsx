import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "AgriVision AI — Smart Farming Platform",
    template: "%s | AgriVision AI",
  },
  description:
    "AI-powered precision agriculture platform for smart farming. Crop intelligence, GPS farm mapping, weather forecasting, disease detection, and multilingual support.",
  keywords: [
    "agriculture",
    "farming",
    "AI",
    "crop detection",
    "disease detection",
    "precision agriculture",
    "smart farming",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
