import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { reviews, bookings, professionals } from "@/db/schema";
import { eq, avg, count } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId, rating, comment } = await req.json();

  if (!bookingId || !rating || !comment?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  // Verify booking belongs to this customer and is COMPLETED
  const [booking] = await db
    .select({ id: bookings.id, customerId: bookings.customerId, professionalId: bookings.professionalId, status: bookings.status })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.customerId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status !== "COMPLETED")
    return NextResponse.json({ error: "Can only review completed bookings" }, { status: 400 });

  // Check no existing review for this booking
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.bookingId, bookingId))
    .limit(1);

  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  // Insert review
  await db.insert(reviews).values({
    bookingId,
    professionalId: booking.professionalId,
    rating,
    comment: comment.trim(),
  });

  // Recalculate aggregate rating for this professional
  const [agg] = await db
    .select({ avg: avg(reviews.rating), count: count(reviews.id) })
    .from(reviews)
    .where(eq(reviews.professionalId, booking.professionalId));

  await db
    .update(professionals)
    .set({
      rating: agg.avg ? parseFloat(agg.avg) : 0,
      reviewCount: agg.count,
    })
    .where(eq(professionals.id, booking.professionalId));

  return NextResponse.json({ success: true });
}
