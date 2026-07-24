export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard shell (sidebar + header) will be added here */}
      <main className="p-6">{children}</main>
    </div>
  );
}
