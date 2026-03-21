"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/professionals?q=${encodeURIComponent(q)}` : "/professionals");
  }

  return (
    <>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-up-delay-3">
        <div className="flex-1 flex items-center gap-3 bg-white border border-[var(--border)] rounded-2xl px-5 py-3 shadow-sm">
          <Search size={18} className="text-[var(--muted-foreground)] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "house cleaner near me"…'
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <Button
          type="submit"
          className="bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-2xl px-8 py-6 text-sm font-medium whitespace-nowrap w-full sm:w-auto"
        >
          Search
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 animate-fade-up-delay-4">
        <span className="text-xs text-[var(--muted-foreground)] self-center">Popular:</span>
        {["House cleaning", "Math tutor", "Wedding photos", "Personal trainer"].map((s) => (
          <Link
            key={s}
            href={`/professionals?q=${encodeURIComponent(s)}`}
            className="text-xs bg-white border border-[var(--border)] rounded-full px-3 py-1.5 hover:border-[var(--terra)] hover:text-[var(--terra)] transition-colors"
          >
            {s}
          </Link>
        ))}
      </div>
    </>
  );
}
