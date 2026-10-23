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
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.AUTH_URL ??
          process.env.NEXTAUTH_URL ??
          "https://agrivision-ai-steel.vercel.app"
  ),
  title: {
    default: "AgriVision.AI — Smart Farming",
    template: "%s | AgriVision.AI",
  },
  description:
    "AI-powered crop intelligence, plant disease detection, and smart farming solutions for farmers.",
  openGraph: {
    title: "AgriVision.AI — Smart Farming",
    description:
      "AI-powered crop intelligence, plant disease detection, and smart farming solutions for farmers.",
    siteName: "AgriVision.AI",
    images: [
      {
        url: "/agrivision-logo.png",
        width: 1254,
        height: 1254,
        alt: "AgriVision.AI — Smart Farming",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AgriVision.AI — Smart Farming",
    description:
      "AI-powered crop intelligence, plant disease detection, and smart farming solutions for farmers.",
    images: ["/agrivision-logo.png"],
  },
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
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var saved=localStorage.getItem("agrivision-ui-preferences");if(saved){var theme=JSON.parse(saved)?.state?.theme;document.documentElement.classList.toggle("dark",theme!=="light")}}catch{}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
