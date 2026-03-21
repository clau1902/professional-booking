import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { professionals, services } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [profile] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, session.user.id))
    .limit(1);

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.professionalId, profile.id)));

  return NextResponse.json({ success: true });
}
