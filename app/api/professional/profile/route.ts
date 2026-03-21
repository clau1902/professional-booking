import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { professionals, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (user?.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Only professionals can create a profile" }, { status: 403 });
  }

  const existing = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, session.user.id))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
  }

  const { bio, category, hourlyRate, location, yearsExp } = await req.json();

  if (!bio || !category || !hourlyRate || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [profile] = await db
    .insert(professionals)
    .values({
      userId: session.user.id,
      bio,
      category,
      hourlyRate: parseFloat(hourlyRate),
      location,
      yearsExp: parseInt(yearsExp) || 0,
    })
    .returning();

  return NextResponse.json(profile, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, session.user.id))
    .limit(1);

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { bio, category, hourlyRate, location, yearsExp, isAvailable } = await req.json();

  const [updated] = await db
    .update(professionals)
    .set({
      ...(bio !== undefined && { bio }),
      ...(category !== undefined && { category }),
      ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
      ...(location !== undefined && { location }),
      ...(yearsExp !== undefined && { yearsExp: parseInt(yearsExp) }),
      ...(isAvailable !== undefined && { isAvailable }),
      updatedAt: new Date(),
    })
    .where(eq(professionals.id, profile.id))
    .returning();

  return NextResponse.json(updated);
}
