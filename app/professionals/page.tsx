import { db } from "@/db";
import { professionals, users } from "@/db/schema";
import { eq, like, and, gte, lte, or, ilike } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, ShieldCheck } from "lucide-react";
import { ProfessionalFilters } from "@/components/ProfessionalFilters";
import { ProAvatar, ProCover } from "@/components/ProAvatar";

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

  // Filter by search query (name or bio)
  let filtered = results;
  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = results.filter(
      (p) =>
        p.userName.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }

  if (params.location) {
    const loc = params.location.toLowerCase();
    filtered = filtered.filter((p) => p.location.toLowerCase().includes(loc));
  }

  // Sort
  if (params.sort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (params.sort === "price_asc") {
    filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
  } else if (params.sort === "price_desc") {
    filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
  } else if (params.sort === "reviews") {
    filtered.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return filtered;
}

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pros = await getProfessionals(params);
  const activeCategory = params.category || "All";

  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl lg:text-5xl font-light mb-3">
            Find a professional
          </h1>
          <p className="text-[var(--muted-foreground)]">
            {pros.length} professional{pros.length !== 1 ? "s" : ""} available
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          </p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/professionals${cat === "All" ? "" : `?category=${cat}`}`}
            >
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
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 shrink-0">
            <ProfessionalFilters currentParams={params} />
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
                  <Button variant="outline" className="rounded-full">
                    Clear filters
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {pros.map((pro) => (
                  <Link key={pro.id} href={`/professionals/${pro.id}`}>
                    <article className="bg-white rounded-2xl overflow-hidden border border-[var(--border)] card-hover h-full flex flex-col">
                      {/* Cover */}
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
