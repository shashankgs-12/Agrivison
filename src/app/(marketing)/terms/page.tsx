import { InformationPage } from "@/components/marketing/information-page";

export default function TermsPage() {
  return (
    <InformationPage title="Terms of Use" description="Guidelines for using AgriVision.AI features and agricultural information.">
      <section><h2 className="text-lg font-bold text-slate-900 dark:text-white">Use of the service</h2><p>Keep your account credentials secure and provide accurate farm and crop information. You are responsible for activity performed through your account and for reviewing records before relying on them.</p></section>
      <section><h2 className="text-lg font-bold text-slate-900 dark:text-white">AI and agricultural guidance</h2><p>Plant identification, disease analysis, weather summaries, and recommendations are informational tools. They can be incomplete or incorrect and are not a substitute for an on-site inspection, a qualified agronomist, a soil test, or approved product labels. Confirm important decisions with local expertise.</p></section>
      <section><h2 className="text-lg font-bold text-slate-900 dark:text-white">Availability</h2><p>Some features depend on internet access and third-party services. The service may show cached information when offline; check its timestamp and verify changing conditions before taking action.</p></section>
      <p className="text-xs text-slate-500 dark:text-slate-400">These terms summarize expected use of the current application and should be reviewed by the site operator before public production use.</p>
    </InformationPage>
  );
}
