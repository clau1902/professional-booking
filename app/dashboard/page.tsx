import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { bookings, professionals, services, users, availability } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Star, ArrowRight, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { DashboardLogout } from "@/components/DashboardLogout";
import { ProfessionalOnboarding } from "@/components/ProfessionalOnboarding";
import { BookingStatusButtons } from "@/components/BookingStatusButtons";
import { AddServiceForm } from "@/components/AddServiceForm";
import { DeleteServiceButton } from "@/components/DeleteServiceButton";
import { EditProfileSection } from "@/components/EditProfileSection";

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login?callbackUrl=/dashboard");

  // Get role from DB (source of truth)
  const [dbUser] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, avatar: users.avatar })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!dbUser) redirect("/auth/login");

  if (dbUser.role === "ADMIN") redirect("/admin");

  // ─── Professional view ────────────────────────────────────────────────────
  if (dbUser.role === "PROFESSIONAL") {
    const [profile] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, dbUser.id))
      .limit(1);

    return (
      <div className="pt-20 min-h-screen bg-[var(--cream)]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[var(--terra)] mb-2">
                Professional Account
              </p>
              <h1 className="font-display text-4xl font-light">
                {profile ? `Welcome back, ${dbUser.name.split(" ")[0]}` : `Hello, ${dbUser.name.split(" ")[0]}`}
              </h1>
              <p className="text-[var(--muted-foreground)] mt-1">{dbUser.email}</p>
            </div>
            <DashboardLogout />
          </div>

          {!profile ? (
            <>
              <div className="bg-white rounded-3xl p-8 border border-[var(--border)] mb-6">
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="font-display text-2xl mb-1">Set up your professional profile</h2>
                <p className="text-[var(--muted-foreground)] text-sm mb-8">
                  Complete your profile so customers can find and book you.
                </p>
                <ProfessionalOnboarding userName={dbUser.name} />
              </div>
            </>
          ) : (
            <ProfessionalDashboardView profile={profile} userAvatar={dbUser.avatar} />
          )}
        </div>
      </div>
    );
  }

  // ─── Customer view ────────────────────────────────────────────────────────
  const userBookings = await db
    .select({
      id: bookings.id,
      date: bookings.date,
      status: bookings.status,
      totalPrice: bookings.totalPrice,
      notes: bookings.notes,
      createdAt: bookings.createdAt,
      serviceName: services.name,
      serviceDuration: services.duration,
      professionalName: users.name,
      professionalCategory: professionals.category,
      professionalLocation: professionals.location,
      professionalId: professionals.id,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(professionals, eq(bookings.professionalId, professionals.id))
    .innerJoin(users, eq(professionals.userId, users.id))
    .where(eq(bookings.customerId, dbUser.id))
    .orderBy(desc(bookings.createdAt));

  const upcoming = userBookings.filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED"
  );
  const past = userBookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[var(--terra)] mb-2">My Account</p>
            <h1 className="font-display text-4xl font-light">
              Welcome back, {dbUser.name.split(" ")[0]}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">{dbUser.email}</p>
          </div>
          <DashboardLogout />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total bookings", value: userBookings.length },
            { label: "Upcoming", value: upcoming.length },
            { label: "Completed", value: past.filter((b) => b.status === "COMPLETED").length },
            {
              label: "Total spent",
              value: `$${userBookings
                .filter((b) => b.status !== "CANCELLED")
                .reduce((sum, b) => sum + b.totalPrice, 0)
                .toFixed(0)}`,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[var(--border)]">
              <p className="font-display text-3xl font-light mb-1">{stat.value}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="upcoming">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-[var(--cream-dark)] rounded-2xl p-1">
              <TabsTrigger value="upcoming" className="rounded-xl">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-xl">
                Past ({past.length})
              </TabsTrigger>
            </TabsList>
            <Link href="/professionals">
              <Button size="sm" className="bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl">
                Book again <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-[var(--border)]">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display text-2xl mb-2">No upcoming bookings</h3>
                <p className="text-[var(--muted-foreground)] mb-6">Book a professional to get started.</p>
                <Link href="/professionals">
                  <Button className="bg-[var(--terra)] text-white rounded-xl">Browse professionals</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((b) => <CustomerBookingCard key={b.id} booking={b} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-[var(--border)]">
                <p className="text-[var(--muted-foreground)]">No past bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {past.map((b) => <CustomerBookingCard key={b.id} booking={b} showReview />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Professional Dashboard ───────────────────────────────────────────────────

async function ProfessionalDashboardView({
  profile,
  userAvatar,
}: {
  profile: typeof professionals.$inferSelect;
  userAvatar?: string | null;
}) {
  const [proServices, proBookings, proAvailability] = await Promise.all([
    db
      .select()
      .from(services)
      .where(eq(services.professionalId, profile.id))
      .orderBy(desc(services.createdAt)),

    db
      .select({
        id: bookings.id,
        date: bookings.date,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        serviceName: services.name,
        customerName: users.name,
        customerEmail: users.email,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(users, eq(bookings.customerId, users.id))
      .where(eq(bookings.professionalId, profile.id))
      .orderBy(desc(bookings.createdAt)),

    db
      .select({ dayOfWeek: availability.dayOfWeek, startTime: availability.startTime, endTime: availability.endTime })
      .from(availability)
      .where(eq(availability.professionalId, profile.id)),
  ]);

  const pending   = proBookings.filter((b) => b.status === "PENDING");
  const confirmed = proBookings.filter((b) => b.status === "CONFIRMED");
  const completed = proBookings.filter((b) => b.status === "COMPLETED");
  const totalEarned = proBookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pending requests", value: pending.length },
          { label: "Confirmed", value: confirmed.length },
          { label: "Completed jobs", value: completed.length },
          { label: "Total earned", value: `$${totalEarned.toFixed(0)}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[var(--border)]">
            <p className="font-display text-3xl font-light mb-1">{stat.value}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-6 border border-[var(--border)] mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--terra)] mb-1">Your profile</p>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)] mt-2">
            <span className="font-semibold text-[var(--foreground)]">{profile.category}</span>
            <span className="flex items-center gap-1"><MapPin size={13} />{profile.location}</span>
            <span className="flex items-center gap-1"><DollarSign size={13} />${profile.hourlyRate}/hr</span>
            <span className="flex items-center gap-1"><Star size={13} />{profile.rating} ({profile.reviewCount} reviews)</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 line-clamp-2">{profile.bio}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
            profile.isAvailable
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
          }`}>
            {profile.isAvailable ? "Available" : "Unavailable"}
          </span>
          <EditProfileSection
            profile={{ bio: profile.bio, category: profile.category, hourlyRate: profile.hourlyRate, location: profile.location, yearsExp: profile.yearsExp, avatarUrl: userAvatar }}
            currentAvailability={proAvailability}
          />
          <Link href={`/professionals/${profile.id}`}>
            <Button variant="outline" size="sm" className="rounded-xl text-xs">View public profile</Button>
          </Link>
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="bookings">
        <TabsList className="bg-[var(--cream-dark)] rounded-2xl p-1 mb-6">
          <TabsTrigger value="bookings" className="rounded-xl">
            Bookings {pending.length > 0 && (
              <span className="ml-1.5 bg-[var(--terra)] text-white text-xs px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-xl">
            My services ({proServices.length})
          </TabsTrigger>
        </TabsList>

        {/* Bookings tab */}
        <TabsContent value="bookings">
          {proBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-[var(--border)]">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="font-display text-2xl mb-2">No bookings yet</h3>
              <p className="text-[var(--muted-foreground)]">
                Once customers book you, their requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 border border-[var(--border)] flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{booking.serviceName}</p>
                      <Badge className={`text-xs border ${STATUS_STYLES[booking.status] ?? ""}`}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--terra)]">{booking.customerName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{booking.customerEmail}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)] mt-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {format(new Date(booking.date), "EEE, MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {format(new Date(booking.date), "h:mm a")}
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-1.5 italic">
                        Note: {booking.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <p className="font-display text-xl font-semibold">${booking.totalPrice}</p>
                    <BookingStatusButtons bookingId={booking.id} status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Services tab */}
        <TabsContent value="services">
          <div className="space-y-3">
            {proServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-5 border border-[var(--border)] flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="font-semibold">{service.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{service.description}</p>
                  <div className="flex gap-4 text-xs text-[var(--muted-foreground)] mt-2">
                    <span className="flex items-center gap-1"><DollarSign size={12} />${service.price}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{service.duration} min</span>
                  </div>
                </div>
                <DeleteServiceButton serviceId={service.id} />
              </div>
            ))}

            <div className="pt-2">
              <AddServiceForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

// ─── Customer booking card ────────────────────────────────────────────────────

function CustomerBookingCard({
  booking,
  showReview = false,
}: {
  booking: {
    id: string;
    date: Date;
    status: string;
    totalPrice: number;
    notes: string | null;
    serviceName: string;
    serviceDuration: number;
    professionalName: string;
    professionalCategory: string;
    professionalLocation: string;
    professionalId: string;
  };
  showReview?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--border)] flex flex-col sm:flex-row items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold">{booking.serviceName}</p>
          <Badge className={`text-xs border ${STATUS_STYLES[booking.status] ?? ""}`}>
            {booking.status}
          </Badge>
        </div>
        <p className="text-sm text-[var(--terra)]">with {booking.professionalName}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{booking.professionalCategory}</p>
        <div className="flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)] mt-2">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {format(new Date(booking.date), "EEE, MMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {format(new Date(booking.date), "h:mm a")} · {booking.serviceDuration} min
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={12} />
            {booking.professionalLocation.split(",")[0]}
          </span>
        </div>
        {booking.notes && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1.5 italic">Note: {booking.notes}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <p className="font-display text-xl font-semibold">${booking.totalPrice}</p>
        <div className="flex gap-2">
          <Link href={`/professionals/${booking.professionalId}`}>
            <Button variant="outline" size="sm" className="rounded-xl text-xs">View pro</Button>
          </Link>
          {showReview && booking.status === "COMPLETED" && (
            <Button size="sm" className="bg-[var(--terra)] text-white rounded-xl text-xs gap-1">
              <Star size={11} />Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
