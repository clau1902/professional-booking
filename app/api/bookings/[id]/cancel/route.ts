import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { bookings, professionals, services, users } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import {
  sendBookingCancelledToCustomer,
  sendBookingCancelledToProfessional,
} from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let cancelSeries = false;
  try {
    const body = await req.json();
    cancelSeries = !!body?.cancelSeries;
  } catch { /* no body */ }

  const [booking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      customerId: bookings.customerId,
      professionalId: bookings.professionalId,
      serviceId: bookings.serviceId,
      date: bookings.date,
      stripeSessionId: bookings.stripeSessionId,
      recurringGroupId: bookings.recurringGroupId,
    })
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.customerId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["PENDING", "CONFIRMED"].includes(booking.status))
    return NextResponse.json({ error: "This booking cannot be cancelled" }, { status: 400 });

  // For series cancellation, find all cancellable bookings in the group
  let seriesBookings: { id: string; stripeSessionId: string | null }[] = [];
  if (cancelSeries && booking.recurringGroupId) {
    seriesBookings = await db
      .select({ id: bookings.id, stripeSessionId: bookings.stripeSessionId })
      .from(bookings)
      .where(
        and(
          eq(bookings.recurringGroupId, booking.recurringGroupId),
          eq(bookings.customerId, session.user.id),
          inArray(bookings.status, ["PENDING", "CONFIRMED"])
        )
      );
  }

  // Find the stripe session to refund (first booking in series has it)
  const stripeSessionId =
    booking.stripeSessionId ??
    seriesBookings.find((b) => b.stripeSessionId)?.stripeSessionId ??
    null;

  // Issue Stripe refund
  if (stripeSessionId) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (checkoutSession.payment_intent) {
        await stripe.refunds.create({
          payment_intent: checkoutSession.payment_intent as string,
        });
      }
    } catch (err) {
      console.error("Stripe refund failed:", err);
      return NextResponse.json({ error: "Refund failed. Please contact support." }, { status: 500 });
    }
  }

  // Cancel booking(s)
  const idsToCancel = cancelSeries && seriesBookings.length > 0
    ? seriesBookings.map((b) => b.id)
    : [id];

  await db
    .update(bookings)
    .set({ status: "CANCELLED", updatedAt: new Date() })
    .where(inArray(bookings.id, idsToCancel));

  // Send emails
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [customer, professional, service] = await Promise.all([
    db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, booking.customerId)).limit(1),
    db.select({ name: users.name, email: users.email })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(professionals.id, booking.professionalId))
      .limit(1),
    db.select({ name: services.name }).from(services).where(eq(services.id, booking.serviceId)).limit(1),
  ]);

  if (customer[0] && professional[0] && service[0]) {
    const base = {
      customerName: customer[0].name,
      professionalName: professional[0].name,
      serviceName: service[0].name,
      date: booking.date,
      appUrl,
    };
    Promise.allSettled([
      sendBookingCancelledToCustomer({ to: customer[0].email, ...base }),
      sendBookingCancelledToProfessional({ to: professional[0].email, ...base }),
    ]);
  }

  return NextResponse.json({ success: true });
}
