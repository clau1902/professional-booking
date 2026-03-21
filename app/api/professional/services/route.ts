import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { professionals, services } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, session.user.id))
    .limit(1);

  if (!profile) return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });

  const { name, description, price, duration } = await req.json();

  if (!name || !description || !price || !duration) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [service] = await db
    .insert(services)
    .values({
      professionalId: profile.id,
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
    })
    .returning();

  return NextResponse.json(service, { status: 201 });
}
