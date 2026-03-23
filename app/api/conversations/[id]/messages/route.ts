import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { conversations, messages, users, professionals } from "@/db/schema";
import { eq, and, or, asc, sql } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

async function getConversationAndVerify(convId: string, userId: string) {
  const [conv] = await db
    .select({ id: conversations.id, customerId: conversations.customerId, professionalId: conversations.professionalId })
    .from(conversations)
    .where(eq(conversations.id, convId))
    .limit(1);

  if (!conv) return null;

  // Check user is participant (customer or the professional)
  const [pro] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(and(eq(professionals.id, conv.professionalId), eq(professionals.userId, userId)))
    .limit(1);

  const isParticipant = conv.customerId === userId || !!pro;
  if (!isParticipant) return null;

  return conv;
}

// GET — fetch all messages and mark unread ones as read
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await getConversationAndVerify(id, session.user.id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rows = await db
    .select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      senderName: users.name,
      senderAvatar: users.avatar,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  // Mark messages from the other person as read
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, id),
        eq(messages.isRead, false),
        sql`${messages.senderId} != ${session.user.id}`
      )
    );

  return NextResponse.json(rows);
}

// POST — send a message
export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await getConversationAndVerify(id, session.user.id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

  const [msg] = await db
    .insert(messages)
    .values({ conversationId: id, senderId: session.user.id, content: content.trim() })
    .returning();

  // Bump conversation updatedAt for ordering
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id));

  return NextResponse.json(msg, { status: 201 });
}
