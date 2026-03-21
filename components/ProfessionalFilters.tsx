"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";

interface Props {
  currentParams: {
    q?: string;
    category?: string;
    minRate?: string;
    maxRate?: string;
    location?: string;
    verified?: string;
    sort?: string;
  };
}

export function ProfessionalFilters({ currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(currentParams.q ?? "");
  const [location, setLocation] = useState(currentParams.location ?? "");
  const [minRate, setMinRate] = useState(currentParams.minRate ?? "");
  const [maxRate, setMaxRate] = useState(currentParams.maxRate ?? "");
  const [verified, setVerified] = useState(currentParams.verified === "true");
  const [sort, setSort] = useState(currentParams.sort ?? "rating");

  function apply() {
    const params = new URLSearchParams();
    if (currentParams.category) params.set("category", currentParams.category);
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (minRate) params.set("minRate", minRate);
    if (maxRate) params.set("maxRate", maxRate);
    if (verified) params.set("verified", "true");
    if (sort) params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    setQ("");
    setLocation("");
    setMinRate("");
    setMaxRate("");
    setVerified(false);
    setSort("rating");
    router.push(pathname + (currentParams.category ? `?category=${currentParams.category}` : ""));
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal size={16} />
        <h3 className="font-semibold text-sm">Filters</h3>
      </div>

      {/* Search */}
      <div className="mb-5">
        <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
          Search
        </Label>
        <Input
          placeholder="Name, skill, keyword…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="text-sm rounded-xl"
        />
      </div>

      <Separator className="mb-5" />

      {/* Location */}
      <div className="mb-5">
        <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
          Location
        </Label>
        <Input
          placeholder="City or zip code"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-sm rounded-xl"
        />
      </div>

      <Separator className="mb-5" />

      {/* Price range */}
      <div className="mb-5">
        <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
          Hourly Rate ($)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={minRate}
            onChange={(e) => setMinRate(e.target.value)}
            className="text-sm rounded-xl"
          />
          <span className="text-[var(--muted-foreground)] text-sm">—</span>
          <Input
            placeholder="Max"
            type="number"
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
            className="text-sm rounded-xl"
          />
        </div>
      </div>

      <Separator className="mb-5" />

      {/* Sort */}
      <div className="mb-5">
        <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
          Sort by
        </Label>
        <div className="space-y-1.5">
          {[
            ["rating", "Highest rated"],
            ["reviews", "Most reviewed"],
            ["price_asc", "Price: low to high"],
            ["price_desc", "Price: high to low"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                sort === value
                  ? "bg-[var(--foreground)] text-[var(--cream)]"
                  : "hover:bg-[var(--cream-dark)] text-[var(--foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="mb-5" />

      {/* Verified only */}
      <div className="mb-6">
        <button
          onClick={() => setVerified(!verified)}
          className={`w-full flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl border transition-all ${
            verified
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "border-[var(--border)] hover:border-emerald-200"
          }`}
        >
          <ShieldCheck size={15} className={verified ? "text-emerald-600" : "text-[var(--muted-foreground)]"} />
          Verified professionals only
        </button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={reset}
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl text-xs"
        >
          Reset
        </Button>
        <Button
          onClick={apply}
          size="sm"
          className="flex-1 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl text-xs"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
