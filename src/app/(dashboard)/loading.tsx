export default function DashboardLoading() {
  return (
    <div
      className="mx-auto max-w-7xl space-y-6 animate-fade-in"
      role="status"
      aria-label="Loading page"
    >
      <span className="sr-only">Loading page…</span>
      <div className="space-y-2" aria-hidden="true">
        <div className="animate-skeleton-shimmer h-8 w-56 rounded-lg" />
        <div className="animate-skeleton-shimmer h-4 w-80 max-w-full rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="animate-skeleton-shimmer h-32 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-hidden="true">
        <div className="space-y-6 lg:col-span-2">
          <div className="animate-skeleton-shimmer h-[350px] rounded-2xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="animate-skeleton-shimmer h-48 rounded-2xl" />
            <div className="animate-skeleton-shimmer h-48 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="animate-skeleton-shimmer h-72 rounded-2xl" />
          <div className="animate-skeleton-shimmer h-56 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
