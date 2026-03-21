import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const { id, name, email } = session.user;
  const role = (session.user as { role?: string }).role ?? "CUSTOMER";

  return NextResponse.json({ user: { id, name, email, role } });
}
