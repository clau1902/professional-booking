import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { professionals, users } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const minRate = searchParams.get("minRate");
  const maxRate = searchParams.get("maxRate");

  const conditions = [];
  if (category) conditions.push(eq(professionals.category, category));
  if (minRate) conditions.push(gte(professionals.hourlyRate, parseFloat(minRate)));
  if (maxRate) conditions.push(lte(professionals.hourlyRate, parseFloat(maxRate)));

  const results = await db
    .select({
      id: professionals.id,
      bio: professionals.bio,
      category: professionals.category,
      hourlyRate: professionals.hourlyRate,
      location: professionals.location,
      rating: professionals.rating,
      reviewCount: professionals.reviewCount,
      isVerified: professionals.isVerified,
      yearsExp: professionals.yearsExp,
      coverImage: professionals.coverImage,
      userName: users.name,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return NextResponse.json(results);
}
