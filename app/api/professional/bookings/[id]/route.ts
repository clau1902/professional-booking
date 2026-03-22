import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { professionals, bookings, users, services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  sendBookingConfirmedToCustomer,
  sendBookingCompletedToCustomer,
  sendBookingCancelledToCustomer,
} from "@/lib/email";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING:   ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const [profile] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, session.user.id))
    .limit(1);

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [booking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      date: bookings.date,
      notes: bookings.notes,
      customerId: bookings.customerId,
      serviceId: bookings.serviceId,
      professionalId: bookings.professionalId,
    })
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.professionalId, profile.id)))
    .limit(1);

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const allowed = ALLOWED_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot move from ${booking.status} to ${status}` },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();

  // Send status-change email to customer
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [customer, professional, service] = await Promise.all([
    db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, booking.customerId)).limit(1),
    db.select({ name: users.name }).from(professionals).innerJoin(users, eq(professionals.userId, users.id)).where(eq(professionals.id, booking.professionalId)).limit(1),
    db.select({ name: services.name }).from(services).where(eq(services.id, booking.serviceId)).limit(1),
  ]);

  if (customer[0] && professional[0] && service[0]) {
    const emailArgs = {
      to: customer[0].email,
      customerName: customer[0].name,
      professionalName: professional[0].name,
      serviceName: service[0].name,
      date: booking.date,
      appUrl,
    };

    if (status === "CONFIRMED") {
      sendBookingConfirmedToCustomer(emailArgs).catch(console.error);
    } else if (status === "COMPLETED") {
      sendBookingCompletedToCustomer({ ...emailArgs, professionalId: booking.professionalId }).catch(console.error);
    } else if (status === "CANCELLED") {
      sendBookingCancelledToCustomer(emailArgs).catch(console.error);
    }
  }

  return NextResponse.json(updated);
}
