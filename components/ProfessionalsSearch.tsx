"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";

export function ProfessionalsSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit(e.currentTarget.value);
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    submit("");
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-[var(--border)] rounded-2xl px-5 py-3 shadow-sm max-w-xl">
      <Search size={16} className="text-[var(--muted-foreground)] shrink-0" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        onKeyDown={handleKeyDown}
        placeholder="Search by name, skill, or location…"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
      />
      {defaultValue && (
        <button onClick={handleClear} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
