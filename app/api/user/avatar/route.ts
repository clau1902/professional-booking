import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { avatar } = await req.json();

  if (!avatar || typeof avatar !== "string") {
    return NextResponse.json({ error: "Missing avatar" }, { status: 400 });
  }

  // Validate it's a data URL image (jpeg/png/webp)
  if (!avatar.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
  }

  // Rough size check: base64 of 2MB ≈ 2.7M chars
  if (avatar.length > 3_000_000) {
    return NextResponse.json({ error: "Image too large (max ~2MB)" }, { status: 413 });
  }

  await db
    .update(users)
    .set({ avatar, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
