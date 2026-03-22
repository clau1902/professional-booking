export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Search,
  MessageSquare,
} from "lucide-react";
import { getCategoryMeta, getInitials } from "@/lib/category";
import { HomeSearch } from "@/components/HomeSearch";
import { db } from "@/db";
import { professionals, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const categories = [
  {
    name: "Cleaning",
    emoji: "🧹",
    description: "Home, office & deep clean",
    count: "2,400+ pros",
    color: "bg-sky-50 border-sky-100",
  },
  {
    name: "Tutoring",
    emoji: "📚",
    description: "Math, science, languages & more",
    count: "1,800+ pros",
    color: "bg-amber-50 border-amber-100",
  },
  {
    name: "Photography",
    emoji: "📷",
    description: "Portraits, events & branding",
    count: "900+ pros",
    color: "bg-rose-50 border-rose-100",
  },
  {
    name: "Personal Training",
    emoji: "💪",
    description: "Fitness, yoga & nutrition",
    count: "1,200+ pros",
    color: "bg-emerald-50 border-emerald-100",
  },
  {
    name: "Plumbing",
    emoji: "🔧",
    description: "Repairs, installs & emergencies",
    count: "600+ pros",
    color: "bg-blue-50 border-blue-100",
  },
  {
    name: "Electrical",
    emoji: "⚡",
    description: "Wiring, smart home & EV",
    count: "500+ pros",
    color: "bg-yellow-50 border-yellow-100",
  },
  {
    name: "Gardening",
    emoji: "🌿",
    description: "Landscaping, lawn & plants",
    count: "700+ pros",
    color: "bg-lime-50 border-lime-100",
  },
  {
    name: "Pet Care",
    emoji: "🐾",
    description: "Walking, sitting & training",
    count: "1,100+ pros",
    color: "bg-orange-50 border-orange-100",
  },
];


const steps = [
  {
    icon: Search,
    title: "Browse & filter",
    desc: "Search by service, location, price and availability to find the perfect match.",
  },
  {
    icon: MessageSquare,
    title: "Review profiles",
    desc: "Read verified reviews, compare rates and check availability before booking.",
  },
  {
    icon: CalendarCheck,
    title: "Book instantly",
    desc: "Secure your appointment online. Get confirmation in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Satisfaction guaranteed",
    desc: "Every professional is background-checked and insured. Love it or we'll make it right.",
  },
];

const testimonials = [
  {
    quote: "Found an incredible photographer for our wedding in under 10 minutes. The quality of professionals on this platform is unreal.",
    name: "Rachel M.",
    role: "Bride, San Francisco",
  },
  {
    quote: "My SAT score went up 240 points after just two months of tutoring sessions booked through Handpicked. Worth every penny.",
    name: "Tyler K.",
    role: "Student, New York",
  },
  {
    quote: "The cleaners I've booked have been absolutely exceptional. My apartment has never looked better, and it takes me 2 minutes to schedule.",
    name: "Priya D.",
    role: "Customer, Chicago",
  },
];

export default async function HomePage() {
  let featuredPros: {
    id: string;
    name: string;
    category: string;
    rating: number;
    reviews: number;
    location: string;
    hourlyRate: number;
    isVerified: boolean;
  }[] = [];

  try {
    featuredPros = await db
      .select({
        id: professionals.id,
        name: users.name,
        category: professionals.category,
        rating: professionals.rating,
        reviews: professionals.reviewCount,
        location: professionals.location,
        hourlyRate: professionals.hourlyRate,
        isVerified: professionals.isVerified,
      })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .orderBy(desc(professionals.rating))
      .limit(3);
  } catch {
    // DB unavailable — render page without featured pros
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-[var(--cream)]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 50%, oklch(0.58 0.1 358 / 0.12) 0%, transparent 60%), radial-gradient(circle at 20% 80%, oklch(0.68 0.07 330 / 0.1) 0%, transparent 50%)",
            }}
          />
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[var(--terra-light)] text-[var(--terra)] text-xs font-medium rounded-full px-4 py-1.5 mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--terra)] animate-pulse" />
              50,000+ bookings made this month
            </div>

            <h1 className="font-display text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight text-[var(--foreground)] mb-6 animate-fade-up-delay-1">
              The professionals
              <br />
              <em className="font-normal text-[var(--terra)] not-italic">you deserve,</em>
              <br />
              <span className="font-semibold">at your door.</span>
            </h1>

            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-10 max-w-lg animate-fade-up-delay-2">
              Find vetted, reviewed local professionals for any service — from deep cleaning to
              personal training to portrait photography. Book in minutes.
            </p>

            {/* Search bar + popular */}
            <HomeSearch />
          </div>

          {/* Right: Floating professional cards */}
          <div className="relative hidden lg:block h-[520px] animate-fade-up-delay-2">
            {/* Main card */}
            <div className="absolute top-8 right-0 w-72 bg-white rounded-3xl shadow-xl overflow-hidden border border-[var(--border)]">
              <div className="h-44 flex items-center justify-center relative" style={{ background: getCategoryMeta("Photography").gradient }}>
                <span className="text-7xl opacity-10 absolute select-none">📷</span>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-semibold z-10 shadow-sm" style={{ background: "white", color: getCategoryMeta("Photography").text }}>AO</div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-display text-lg font-semibold">Amara Osei</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Photographer · Los Angeles</p>
                  </div>
                  <Badge className="bg-[var(--terra-light)] text-[var(--terra)] border-0 text-xs">
                    Top Rated
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-[var(--muted-foreground)] ml-1">5.0 (214 reviews)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">$150 / hr</span>
                  <Button size="sm" className="bg-[var(--terra)] text-white rounded-xl text-xs px-4">
                    Book now
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="absolute bottom-16 left-0 bg-[var(--foreground)] text-[var(--cream)] rounded-2xl p-5 shadow-lg w-52">
              <p className="text-xs text-[var(--cream)]/50 mb-1">This month</p>
              <p className="font-display text-3xl font-light mb-3">50k+</p>
              <p className="text-xs text-[var(--cream)]/70 leading-relaxed">
                happy customers booked on Handpicked
              </p>
            </div>

            {/* Rating card */}
            <div className="absolute top-0 left-12 bg-white rounded-2xl p-4 shadow-md border border-[var(--border)] w-44">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {[
                    { initials: "SR", color: "#7c3aed" },
                    { initials: "JL", color: "#0891b2" },
                    { initials: "AO", color: "#be185d" },
                  ].map((av) => (
                    <div
                      key={av.initials}
                      className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: av.color }}
                    >
                      {av.initials}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs font-semibold">4.9 avg. rating</p>
              <p className="text-xs text-[var(--muted-foreground)]">across all pros</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[var(--terra)] mb-3">
                What are you looking for?
              </p>
              <h2 className="font-display text-4xl lg:text-5xl font-light">
                Browse by category
              </h2>
            </div>
            <Link
              href="/professionals"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--terra)] transition-colors"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/professionals?category=${cat.name}`}
                className={`group border rounded-2xl p-6 hover:border-[var(--terra)] transition-all duration-300 card-hover ${cat.color}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="text-3xl mb-4">{cat.emoji}</div>
                <h3 className="font-display text-lg font-semibold mb-1 group-hover:text-[var(--terra)] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">{cat.description}</p>
                <p className="text-xs font-medium text-[var(--terra)]">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-24 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-medium tracking-widest uppercase text-[var(--terra)] mb-3">
              Handpicked for you
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light">
              Top-rated professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredPros.map((pro) => {
              const meta = getCategoryMeta(pro.category);
              const initials = getInitials(pro.name);
              return (
              <div
                key={pro.id}
                className="bg-white rounded-3xl overflow-hidden border border-[var(--border)] card-hover"
              >
                <div className="relative h-64 flex items-center justify-center" style={{ background: meta.gradient }}>
                  <span className="text-8xl opacity-10 absolute select-none">{meta.emoji}</span>
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-semibold z-10 shadow-md"
                    style={{ background: "white", color: meta.text }}
                  >
                    {initials}
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[var(--foreground)] text-[var(--cream)] border-0 text-xs">
                      {pro.isVerified ? "Verified" : "Pro"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
                    <p className="text-sm font-semibold">${pro.hourlyRate}/hr</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{pro.name}</h3>
                      <p className="text-sm text-[var(--terra)]">{pro.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{pro.rating}</span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {pro.reviews} reviews
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-5">{pro.location}</p>
                  <Link href={`/professionals/${pro.id}`}>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-[var(--border)] hover:bg-[var(--terra)] hover:text-white hover:border-[var(--terra)] transition-all"
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/professionals">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--cream)] transition-all"
              >
                Browse all professionals
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-[var(--foreground)] text-[var(--cream)] relative overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, oklch(0.58 0.1 358) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.68 0.07 330) 0%, transparent 40%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-[var(--cream)]/50 mb-3">
              Simple process
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light">
              How Handpicked works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--cream)]/10 border border-[var(--cream)]/20 flex items-center justify-center mx-auto mb-5">
                    <Icon size={22} className="text-[var(--terra)]" />
                  </div>
                  <div className="text-xs font-medium text-[var(--cream)]/40 mb-2">
                    0{i + 1}
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3">{step.title}</h3>
                  <p className="text-sm text-[var(--cream)]/60 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <Link href="/professionals">
              <Button
                size="lg"
                className="bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-full px-10"
              >
                Find a professional now
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-medium tracking-widest uppercase text-[var(--terra)] mb-3">
              Real stories
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light">
              Customers love Handpicked
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-[var(--cream)] rounded-3xl p-8 border border-[var(--border)] flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="font-display text-lg font-light leading-relaxed text-[var(--foreground)] mb-6 flex-1 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: "var(--terra)" }}
                  >
                    {getInitials(t.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-[var(--terra)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl lg:text-5xl font-light text-white mb-6">
            Ready to find your perfect
            <br />
            <em className="font-semibold not-italic">professional?</em>
          </h2>
          <p className="text-white/80 mb-10 text-lg">
            Join 50,000+ customers who&apos;ve found trusted help through Handpicked.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/professionals">
              <Button
                size="lg"
                className="bg-white text-[var(--terra)] hover:bg-white/90 rounded-full px-10"
              >
                Browse professionals
              </Button>
            </Link>
            <Link href="/auth/register?role=professional">
              <Button
                size="lg"
                className="bg-white/20 border-2 border-white text-white hover:bg-white hover:text-[var(--terra)] rounded-full px-10"
              >
                Join as a professional
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
