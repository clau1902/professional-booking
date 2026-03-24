export default function ProfessionalProfileLoading() {
  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      {/* Cover */}
      <div className="h-72 bg-gray-200 animate-pulse relative">
        <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-6 pb-6 flex items-end gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 animate-pulse shrink-0" />
          <div className="space-y-2 pb-1">
            <div className="h-6 w-48 bg-gray-300 rounded-full animate-pulse" />
            <div className="h-4 w-32 bg-gray-300 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Stats row */}
            <div className="flex gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 w-24 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>

            {/* Tabs */}
            <div className="h-10 w-64 bg-gray-200 rounded-2xl animate-pulse" />

            {/* About section */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)] space-y-3">
              <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-4/6 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Services */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-[var(--border)] flex justify-between"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-36 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-3 w-48 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)] space-y-4 sticky top-24">
              <div className="h-5 w-32 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
