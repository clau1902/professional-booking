import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { bookings, professionals, services, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import {
  sendBookingRequestedToCustomer,
  sendBookingRequestedToProfessional,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await createBookingFromSession(session);
  }

  return NextResponse.json({ received: true });
}

export async function createBookingFromSession(session: Stripe.Checkout.Session) {
  const { customerId, professionalId, serviceId, date, notes, totalPrice } =
    session.metadata ?? {};

  if (!customerId || !professionalId || !serviceId || !date || !totalPrice) return;

  // Idempotency — skip if already created (e.g. success page beat the webhook)
  const existing = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.stripeSessionId, session.id))
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(bookings).values({
    customerId,
    professionalId,
    serviceId,
    date: new Date(date),
    notes: notes || null,
    totalPrice: parseFloat(totalPrice),
    status: "PENDING",
    stripeSessionId: session.id,
  });

  // Send emails — fetch needed data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [customer, professional, service] = await Promise.all([
    db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, customerId)).limit(1),
    db.select({ name: users.name, email: users.email })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(professionals.id, professionalId))
      .limit(1),
    db.select({ name: services.name }).from(services).where(eq(services.id, serviceId)).limit(1),
  ]);

  if (!customer[0] || !professional[0] || !service[0]) return;

  const bookingDate = new Date(date);

  await Promise.allSettled([
    sendBookingRequestedToCustomer({
      to: customer[0].email,
      customerName: customer[0].name,
      professionalName: professional[0].name,
      serviceName: service[0].name,
      date: bookingDate,
      totalPrice: parseFloat(totalPrice),
      appUrl,
    }),
    sendBookingRequestedToProfessional({
      to: professional[0].email,
      professionalName: professional[0].name,
      customerName: customer[0].name,
      serviceName: service[0].name,
      date: bookingDate,
      notes,
      appUrl,
    }),
  ]);
}
