import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { professionals, availability } from "@/db/schema";
import { eq } from "drizzle-orm";

// Replace all availability slots for the authenticated professional
export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, session.user.id))
    .limit(1);

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { slots } = await req.json();
  // slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>

  if (!Array.isArray(slots)) {
    return NextResponse.json({ error: "slots must be an array" }, { status: 400 });
  }

  // Delete existing slots then insert new ones
  await db.delete(availability).where(eq(availability.professionalId, profile.id));

  if (slots.length > 0) {
    await db.insert(availability).values(
      slots.map((s: { dayOfWeek: number; startTime: string; endTime: string }) => ({
        professionalId: profile.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }))
    );
  }

  return NextResponse.json({ ok: true });
}
