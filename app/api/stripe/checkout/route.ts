import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { services, professionals, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in to book." }, { status: 401 });
  }

  const { professionalId, serviceId, date, notes, recurringPattern, recurringCount } = await req.json();

  if (!professionalId || !serviceId || !date) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const sessions = recurringPattern && recurringCount > 1 ? Math.min(Number(recurringCount), 12) : 1;

  // Fetch service and professional details for the Stripe line item
  const [service] = await db
    .select({
      id: services.id,
      name: services.name,
      price: services.price,
      duration: services.duration,
    })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  const [pro] = await db
    .select({ userName: users.name, category: professionals.category })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .where(eq(professionals.id, professionalId))
    .limit(1);

  if (!service || !pro) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(service.price * 100), // cents per session
          product_data: {
            name: sessions > 1
              ? `${service.name} × ${sessions} sessions`
              : service.name,
            description: sessions > 1
              ? `${sessions} ${recurringPattern} sessions · ${service.duration} min each with ${pro.userName}`
              : `${service.duration} min session with ${pro.userName} · ${pro.category}`,
          },
        },
        quantity: sessions,
      },
    ],
    metadata: {
      customerId:       session.user.id,
      professionalId,
      serviceId,
      date,
      notes:            notes ?? "",
      totalPrice:       String(service.price * sessions),
      recurringPattern: recurringPattern ?? "",
      recurringCount:   sessions > 1 ? String(sessions) : "",
    },
    success_url: `${appUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${appUrl}/book/${professionalId}?cancelled=true`,
    customer_email: session.user.email ?? undefined,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
