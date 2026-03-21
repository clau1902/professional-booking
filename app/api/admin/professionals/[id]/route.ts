import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { professionals, users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  return user?.role === "ADMIN" ? session : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { isVerified, isAvailable } = await req.json();

  const [updated] = await db
    .update(professionals)
    .set({
      ...(isVerified !== undefined && { isVerified }),
      ...(isAvailable !== undefined && { isAvailable }),
      updatedAt: new Date(),
    })
    .where(eq(professionals.id, id))
    .returning();

  return NextResponse.json(updated);
}
