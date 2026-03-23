export const dynamic = "force-dynamic";

import { db } from "@/db";
import { professionals, users } from "@/db/schema";
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, ShieldCheck } from "lucide-react";
import { ProfessionalFilters } from "@/components/ProfessionalFilters";
import { ProfessionalsSearch } from "@/components/ProfessionalsSearch";
import { ProAvatar, ProCover } from "@/components/ProAvatar";
import { Suspense } from "react";

const CATEGORIES = [
  "All",
  "Cleaning",
  "Tutoring",
  "Photography",
  "Personal Training",
  "Plumbing",
  "Electrical",
  "Gardening",
  "Pet Care",
];

interface SearchParams {
  category?: string;
  q?: string;
  minRate?: string;
  maxRate?: string;
  location?: string;
  verified?: string;
  sort?: string;
}

async function getProfessionals(params: SearchParams) {
  const conditions = [];

  if (params.category && params.category !== "All") {
    conditions.push(eq(professionals.category, params.category));
  }
  if (params.minRate) {
    conditions.push(gte(professionals.hourlyRate, parseFloat(params.minRate)));
  }
  if (params.maxRate) {
    conditions.push(lte(professionals.hourlyRate, parseFloat(params.maxRate)));
  }
  if (params.verified === "true") {
    conditions.push(eq(professionals.isVerified, true));
  }
  if (params.q) {
    const pattern = `%${params.q}%`;
    conditions.push(
      or(
        ilike(users.name, pattern),
        ilike(professionals.bio, pattern),
        ilike(professionals.category, pattern),
        ilike(professionals.location, pattern),
      )!
    );
  }
  if (params.location) {
    conditions.push(ilike(professionals.location, `%${params.location}%`));
  }

  const results = await db
    .select({
      id: professionals.id,
      bio: professionals.bio,
      category: professionals.category,
      hourlyRate: professionals.hourlyRate,
      location: professionals.location,
      rating: professionals.rating,
      reviewCount: professionals.reviewCount,
      isVerified: professionals.isVerified,
      yearsExp: professionals.yearsExp,
      coverImage: professionals.coverImage,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Sort
  if (params.sort === "price_asc") {
    results.sort((a, b) => a.hourlyRate - b.hourlyRate);
  } else if (params.sort === "price_desc") {
    results.sort((a, b) => b.hourlyRate - a.hourlyRate);
  } else if (params.sort === "reviews") {
    results.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    results.sort((a, b) => b.rating - a.rating); // default: highest rated
  }

  return results;
}

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  let pros: Awaited<ReturnType<typeof getProfessionals>> = [];
  try {
    pros = await getProfessionals(params);
  } catch {
    // DB unavailable — render empty state
  }
  const activeCategory = params.category || "All";

  const activeFilterCount = [
    params.q,
    params.location,
    params.minRate,
    params.maxRate,
    params.verified === "true" ? "verified" : null,
    params.sort && params.sort !== "rating" ? params.sort : null,
  ].filter(Boolean).length;

  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl font-light mb-3">
              Find a professional
            </h1>
            <p className="text-[var(--muted-foreground)]">
              {pros.length} professional{pros.length !== 1 ? "s" : ""} available
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
              {params.q ? ` matching "${params.q}"` : ""}
            </p>
          </div>
          <Suspense>
            <ProfessionalsSearch defaultValue={params.q} />
          </Suspense>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const href = cat === "All"
              ? `/professionals${params.q ? `?q=${params.q}` : ""}`
              : `/professionals?category=${cat}${params.q ? `&q=${params.q}` : ""}`;
            return (
              <Link key={cat} href={href}>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                    activeCategory === cat
                      ? "bg-[var(--foreground)] text-[var(--cream)] border-[var(--foreground)]"
                      : "bg-white border-[var(--border)] text-[var(--foreground)] hover:border-[var(--terra)] hover:text-[var(--terra)]"
                  }`}
                >
                  {cat}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 shrink-0">
            <Suspense>
              <ProfessionalFilters
                currentParams={params}
                activeFilterCount={activeFilterCount}
              />
            </Suspense>
          </aside>

          {/* Results grid */}
          <div className="flex-1">
            {pros.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display text-2xl mb-2">No professionals found</h3>
                <p className="text-[var(--muted-foreground)] mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <Link href="/professionals">
                  <Button variant="outline" className="rounded-full">Clear all filters</Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {pros.map((pro) => (
                  <Link key={pro.id} href={`/professionals/${pro.id}`}>
                    <article className="bg-white rounded-2xl overflow-hidden border border-[var(--border)] card-hover h-full flex flex-col">
                      <ProCover category={pro.category} className="h-48">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ProAvatar name={pro.userName} category={pro.category} size="lg" />
                        </div>
                        {pro.isVerified && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 backdrop-blur-sm text-[var(--foreground)] border-0 text-xs gap-1">
                              <ShieldCheck size={11} className="text-emerald-500" />
                              Verified
                            </Badge>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1">
                          <p className="text-xs font-bold">${pro.hourlyRate}/hr</p>
                        </div>
                      </ProCover>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-display text-lg font-semibold leading-tight">
                              {pro.userName}
                            </h3>
                            <p className="text-xs text-[var(--terra)] font-medium mt-0.5">
                              {pro.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mb-2">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold">{pro.rating.toFixed(1)}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            ({pro.reviewCount})
                          </span>
                        </div>

                        <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2 flex-1 leading-relaxed">
                          {pro.bio}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                            <MapPin size={11} />
                            <span>{pro.location.split(",")[0]}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                            <Clock size={11} />
                            <span>{pro.yearsExp}yr exp</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
