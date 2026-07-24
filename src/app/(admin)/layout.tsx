export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Admin layout navigation shell */}
      <main className="p-6">{children}</main>
    </div>
  );
}
