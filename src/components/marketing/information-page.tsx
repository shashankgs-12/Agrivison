import Link from "next/link";
import type { ReactNode } from "react";

export function InformationPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white px-4 py-12 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:py-20">
      <article className="mx-auto max-w-3xl space-y-8">
        <Link href="/" className="font-bold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400">← AgriVision.AI</Link>
        <header className="space-y-3 border-b border-slate-200 pb-6 dark:border-slate-800">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="text-slate-600 dark:text-slate-300">{description}</p>
        </header>
        <div className="space-y-6 text-sm leading-7 text-slate-700 dark:text-slate-300">{children}</div>
      </article>
    </main>
  );
}
