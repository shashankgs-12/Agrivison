import { Mail, MessageCircle } from "lucide-react";
import { InformationPage } from "@/components/marketing/information-page";

export default function ContactPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@agrivision.ai";
  return (
    <InformationPage title="Contact" description="Get help with your AgriVision.AI account or share product feedback.">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><MessageCircle className="h-5 w-5 text-emerald-600" /> Support</h2>
        <p className="mt-2">For account or product questions, email the AgriVision.AI support team.</p>
        <a className="mt-4 inline-flex items-center gap-2 font-bold text-emerald-700 underline dark:text-emerald-400" href={`mailto:${supportEmail}`}><Mail className="h-4 w-4" />{supportEmail}</a>
      </div>
    </InformationPage>
  );
}
