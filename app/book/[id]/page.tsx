export const dynamic = "force-dynamic";

import { db } from "@/db";
import { professionals, users, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ProAvatar } from "@/components/ProAvatar";
import Link from "next/link";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { id } = await params;
  const { serviceId } = await searchParams;

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
      coverImage: professionals.coverImage,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .where(eq(professionals.id, id));

  if (!pro) notFound();

  const proServices = await db
    .select()
    .from(services)
    .where(eq(services.professionalId, id));

  const selectedService = serviceId
    ? proServices.find((s) => s.id === serviceId)
    : proServices[0];

  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href={`/professionals/${id}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to profile
        </Link>

        <h1 className="font-display text-4xl font-light mb-2">Book a session</h1>
        <p className="text-[var(--muted-foreground)] mb-10">
          with <span className="text-[var(--foreground)] font-medium">{pro.userName}</span>
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BookingForm
              professional={pro}
              services={proServices}
              selectedServiceId={selectedService?.id}
            />
          </div>

          {/* Booking summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] sticky top-24">
              {/* Pro info */}
              <div className="flex items-center gap-4 mb-5">
                <ProAvatar name={pro.userName} category={pro.category} size="md" />
                <div>
                  <p className="font-semibold">{pro.userName}</p>
                  <p className="text-xs text-[var(--terra)]">{pro.category}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{pro.location}</p>
                </div>
              </div>

              {selectedService && (
                <div className="bg-[var(--cream)] rounded-2xl p-4 mb-5">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Selected service</p>
                  <p className="font-semibold text-sm mb-1">{selectedService.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">
                    {selectedService.duration} minutes
                  </p>
                  <p className="font-display text-2xl font-semibold">${selectedService.price}</p>
                </div>
              )}

              <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                  Free cancellation up to 24 hours before
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                  Secure payment via Stripe
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                  100% satisfaction guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
