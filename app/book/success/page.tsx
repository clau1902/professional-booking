export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  // Verify the Stripe session
  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (session.payment_status !== "paid") redirect("/");

  const { customerId, professionalId, serviceId, date, notes, totalPrice } =
    session.metadata ?? {};

  if (!customerId || !professionalId || !serviceId || !date || !totalPrice) {
    redirect("/");
  }

  // Create booking if not already created by webhook
  const existing = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.stripeSessionId, session_id))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(bookings).values({
      customerId,
      professionalId,
      serviceId,
      date: new Date(date),
      notes: notes || null,
      totalPrice: parseFloat(totalPrice),
      status: "PENDING",
      stripeSessionId: session_id,
    });
  }

  const bookingDate = new Date(date);

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>

        <h1 className="font-display text-4xl font-light mb-3">You&apos;re booked!</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Your payment was successful and the booking request has been sent to the professional.
        </p>

        {/* Booking details */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--border)] text-left mb-8 space-y-3">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
            <Calendar size={14} />
            <span>Booking details</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Date</span>
            <span className="font-medium">{format(bookingDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Time</span>
            <span className="font-medium">{format(bookingDate, "h:mm a")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Amount paid</span>
            <span className="font-semibold text-emerald-600">${parseFloat(totalPrice).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Status</span>
            <span className="text-amber-600 font-medium">Awaiting confirmation</span>
          </div>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          The professional will confirm within 2 hours. You&apos;ll see the update in your dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard">
            <Button className="w-full h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl gap-2">
              View my bookings
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/professionals">
            <Button variant="outline" className="w-full h-12 rounded-xl">
              Browse more professionals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
