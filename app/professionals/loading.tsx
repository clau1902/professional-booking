export default function ProfessionalsLoading() {
  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-10 w-72 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-5 border border-[var(--border)] space-y-4">
              <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 w-full bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </aside>

          {/* Results grid */}
          <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-[var(--border)]"
              >
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-32 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-4/5 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                    <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
