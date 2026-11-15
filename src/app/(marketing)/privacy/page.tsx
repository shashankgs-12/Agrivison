import { InformationPage } from "@/components/marketing/information-page";

export default function PrivacyPage() {
  return (
    <InformationPage title="Privacy" description="How AgriVision.AI handles account and farm information.">
      <section><h2 className="text-lg font-bold text-slate-900 dark:text-white">Information used by the service</h2><p>When you create an account, the service uses account details such as your name, email address, and optional phone number. Farm boundaries, locations, and crop records are used to provide dashboard features.</p></section>
      <section><h2 className="text-lg font-bold text-slate-900 dark:text-white">Images and AI features</h2><p>Images submitted for plant identification or disease analysis are sent to the configured AI provider to produce a result. Do not upload images that contain private information unrelated to the crop. AI results may be saved in your scan history when that feature is enabled.</p></section>
      <section><h2 className="text-lg font-bold text-slate-900 dark:text-white">Storage and providers</h2><p>AgriVision.AI uses authentication cookies and may store language preferences, weather, farm, crop, and advisor caches in your browser. Sign-in, weather, map, and AI features may use third-party providers configured by the site operator.</p></section>
      <p className="text-xs text-slate-500 dark:text-slate-400">This page describes the application’s current behavior and is not a substitute for jurisdiction-specific legal advice.</p>
    </InformationPage>
  );
}
