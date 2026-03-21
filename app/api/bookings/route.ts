import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Please sign in to book a session." }, { status: 401 });
  }

  const { professionalId, serviceId, date, notes, totalPrice } = await req.json();

  if (!professionalId || !serviceId || !date || !totalPrice) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const [booking] = await db
    .insert(bookings)
    .values({
      customerId: session.user.id,
      professionalId,
      serviceId,
      date: new Date(date),
      notes: notes || null,
      totalPrice,
      status: "PENDING",
    })
    .returning();

  return NextResponse.json(booking, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await db.query.bookings.findMany({
    where: eq(bookings.customerId, session.user.id),
    with: {
      professional: { with: { user: true } },
      service: true,
    },
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });

  return NextResponse.json(results);
}
