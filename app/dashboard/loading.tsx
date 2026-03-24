export default function DashboardLoading() {
  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-9 w-64 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-3 w-44 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[var(--border)]">
              <div className="h-8 w-12 bg-gray-200 rounded-full animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-10 w-64 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Booking cards */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-[var(--border)] flex flex-col sm:flex-row items-start justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-36 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="h-3 w-28 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex gap-4 mt-2">
                  <div className="h-3 w-32 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
