import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { professionals, bookings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    .select({ id: bookings.id, status: bookings.status })
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

  return NextResponse.json(updated);
}
