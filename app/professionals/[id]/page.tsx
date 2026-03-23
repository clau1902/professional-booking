export const dynamic = "force-dynamic";

import { db } from "@/db";
import { professionals, users, services, reviews, bookings, availability } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Calendar,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { ProAvatar, ProCover } from "@/components/ProAvatar";
import { MessageButton } from "@/components/MessageButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user.id;

  const [pro] = await db
    .select({
      id: professionals.id,
      bio: professionals.bio,
      category: professionals.category,
      hourlyRate: professionals.hourlyRate,
      location: professionals.location,
      rating: professionals.rating,
      reviewCount: professionals.reviewCount,
      isVerified: professionals.isVerified,
      isAvailable: professionals.isAvailable,
      yearsExp: professionals.yearsExp,
      coverImage: professionals.coverImage,
      userName: users.name,
      userAvatar: users.avatar,
      userEmail: users.email,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .where(eq(professionals.id, id));

  if (!pro) notFound();

  const proServices = await db
    .select()
    .from(services)
    .where(eq(services.professionalId, id));

  const proReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      customerName: users.name,
      customerAvatar: users.avatar,
    })
    .from(reviews)
    .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
    .innerJoin(users, eq(bookings.customerId, users.id))
    .where(eq(reviews.professionalId, id))
    .limit(10);

  const proAvailability = await db
    .select()
    .from(availability)
    .where(eq(availability.professionalId, id));

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: proReviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      {/* Hero banner */}
      <ProCover category={pro.category} className="h-72">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </ProCover>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10 pb-24">
        <Link
          href="/professionals"
          className="inline-flex items-center gap-2 text-white text-sm mb-8 hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to professionals
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Profile header card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[var(--border)] mb-6">
              <div className="flex items-start gap-5 mb-6">
                <div className="border-4 border-white shadow-md rounded-2xl shrink-0">
                  <ProAvatar name={pro.userName} category={pro.category} avatarUrl={pro.userAvatar} size="lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="font-display text-3xl font-semibold">{pro.userName}</h1>
                      <p className="text-[var(--terra)] font-medium mt-0.5">{pro.category} Professional</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {pro.isVerified && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                          <ShieldCheck size={12} />
                          Verified
                        </Badge>
                      )}
                      {pro.isAvailable && (
                        <Badge className="bg-sky-50 text-sky-700 border-sky-200 gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-4 mt-3 text-sm text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1.5">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <strong className="text-[var(--foreground)]">{pro.rating.toFixed(1)}</strong>
                      ({pro.reviewCount} reviews)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {pro.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {pro.yearsExp} years experience
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[var(--foreground)] leading-relaxed">{pro.bio}</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="services">
              <TabsList className="w-full bg-[var(--cream-dark)] rounded-2xl p-1 mb-6">
                <TabsTrigger value="services" className="flex-1 rounded-xl">Services</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 rounded-xl">
                  Reviews ({proReviews.length})
                </TabsTrigger>
                <TabsTrigger value="availability" className="flex-1 rounded-xl">Availability</TabsTrigger>
              </TabsList>

              {/* Services tab */}
              <TabsContent value="services" className="space-y-4">
                {proServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl p-6 border border-[var(--border)] flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold mb-1">{service.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {service.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-2xl font-semibold text-[var(--foreground)]">
                        ${service.price}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mb-3">per session</p>
                      <Link href={`/book/${pro.id}?serviceId=${service.id}`}>
                        <Button
                          size="sm"
                          className="bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl text-xs"
                        >
                          Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Reviews tab */}
              <TabsContent value="reviews">
                {proReviews.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-[var(--border)]">
                    <MessageSquare size={32} className="mx-auto mb-4 text-[var(--muted-foreground)]" />
                    <p className="font-display text-lg mb-1">No reviews yet</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Be the first to book and leave a review!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Rating distribution */}
                    <div className="bg-white rounded-2xl p-6 border border-[var(--border)] mb-4">
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="font-display text-5xl font-light">{pro.rating.toFixed(1)}</p>
                          <div className="flex gap-1 justify-center mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={s <= Math.round(pro.rating) ? "fill-amber-400 text-amber-400" : "text-[var(--border)]"}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            {pro.reviewCount} reviews
                          </p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {ratingDist.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-xs w-4 text-[var(--muted-foreground)]">{star}</span>
                              <div className="flex-1 h-2 bg-[var(--cream-dark)] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full"
                                  style={{
                                    width: pro.reviewCount > 0 ? `${(count / pro.reviewCount) * 100}%` : "0%",
                                  }}
                                />
                              </div>
                              <span className="text-xs w-4 text-[var(--muted-foreground)]">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Review list */}
                    <div className="space-y-4">
                      {proReviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-white rounded-2xl p-6 border border-[var(--border)]"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--cream-dark)] overflow-hidden shrink-0">
                              {review.customerAvatar ? (
                                <img src={review.customerAvatar} alt={review.customerName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-semibold">
                                  {review.customerName[0]}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-sm">{review.customerName}</p>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={12}
                                    className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-[var(--border)]"}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Availability tab */}
              <TabsContent value="availability">
                <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
                  <h3 className="font-display text-lg font-semibold mb-5">Weekly Schedule</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((day, i) => {
                      const avail = proAvailability.find((a) => a.dayOfWeek === i);
                      return (
                        <div
                          key={day}
                          className={`rounded-xl p-3 text-center ${
                            avail
                              ? "bg-emerald-50 border border-emerald-100"
                              : "bg-[var(--cream-dark)] border border-[var(--border)]"
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1">{day}</p>
                          {avail ? (
                            <div>
                              <CheckCircle size={14} className="text-emerald-500 mx-auto mb-1" />
                              <p className="text-[10px] text-emerald-600">{avail.startTime}</p>
                              <p className="text-[10px] text-emerald-600">{avail.endTime}</p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Off</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar booking card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--border)] sticky top-24">
              <div className="text-center mb-5">
                <p className="font-display text-3xl font-semibold">
                  ${pro.hourlyRate}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">per hour</p>
              </div>

              <Separator className="mb-5" />

              {/* Service quick-select */}
              <div className="mb-5">
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                  Select a service
                </p>
                <div className="space-y-2">
                  {proServices.slice(0, 3).map((service) => (
                    <Link
                      key={service.id}
                      href={`/book/${pro.id}?serviceId=${service.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:border-[var(--terra)] hover:bg-[var(--terra-light)] transition-all group"
                    >
                      <span className="text-sm group-hover:text-[var(--terra)] transition-colors">
                        {service.name}
                      </span>
                      <span className="text-sm font-semibold">${service.price}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link href={`/book/${pro.id}`}>
                <Button className="w-full bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-2xl py-6 text-base font-medium">
                  <Calendar size={16} className="mr-2" />
                  Book a Session
                </Button>
              </Link>
              <MessageButton
                professionalId={pro.id}
                professionalName={pro.userName}
                currentUserId={currentUserId}
                variant="outline"
              />

              <p className="text-center text-xs text-[var(--muted-foreground)] mt-3">
                Free cancellation up to 24h before
              </p>

              <Separator className="my-5" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                  Background checked
                </div>
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                  Satisfaction guaranteed
                </div>
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Clock size={15} className="text-emerald-500 shrink-0" />
                  Typically responds in &lt;2 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
