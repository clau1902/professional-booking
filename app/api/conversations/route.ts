import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { conversations, messages, users, professionals } from "@/db/schema";
import { eq, or, and, desc, count, sql } from "drizzle-orm";

// GET — list all conversations for the current user with last message + unread count
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const rows = await db
    .select({
      id: conversations.id,
      customerId: conversations.customerId,
      professionalId: conversations.professionalId,
      updatedAt: conversations.updatedAt,
      otherName: users.name,
      otherAvatar: users.avatar,
      unreadCount: count(messages.id).as("unread_count"),
    })
    .from(conversations)
    .innerJoin(
      users,
      or(
        and(eq(conversations.customerId, userId), eq(users.id, sql`${conversations.professionalId}`)),
        and(eq(conversations.professionalId, sql`(SELECT id FROM professionals WHERE user_id = ${userId} LIMIT 1)`), eq(users.id, conversations.customerId)),
      )!
    )
    .leftJoin(
      messages,
      and(eq(messages.conversationId, conversations.id), eq(messages.isRead, false), sql`${messages.senderId} != ${userId}`)
    )
    .where(
      or(
        eq(conversations.customerId, userId),
        eq(conversations.professionalId, sql`(SELECT id FROM professionals WHERE user_id = ${userId} LIMIT 1)`)
      )!
    )
    .groupBy(conversations.id, users.name, users.avatar)
    .orderBy(desc(conversations.updatedAt));

  return NextResponse.json(rows);
}

// POST — get or create a conversation between current user (customer) and a professional
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { professionalId } = await req.json();
  if (!professionalId) return NextResponse.json({ error: "Missing professionalId" }, { status: 400 });

  // Verify professional exists
  const [pro] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.id, professionalId))
    .limit(1);
  if (!pro) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

  // Find existing conversation
  const [existing] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.customerId, session.user.id), eq(conversations.professionalId, professionalId)))
    .limit(1);

  if (existing) return NextResponse.json({ id: existing.id });

  // Create new
  const [created] = await db
    .insert(conversations)
    .values({ customerId: session.user.id, professionalId })
    .returning({ id: conversations.id });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
