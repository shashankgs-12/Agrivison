import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
