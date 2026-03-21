import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

const connection = postgres(process.env.DATABASE_URL!);
const db = drizzle(connection, { schema });

const categories = [
  "Cleaning",
  "Tutoring",
  "Photography",
  "Personal Training",
  "Plumbing",
  "Electrical",
  "Gardening",
  "Pet Care",
];

const professionalsData = [
  {
    name: "Sofia Reyes",
    email: "sofia@example.com",
    bio: "Professional house cleaner with 8 years of experience. I specialize in deep cleaning, move-in/move-out cleaning, and recurring maintenance for residential and commercial spaces.",
    category: "Cleaning",
    hourlyRate: 18,
    location: "San Francisco, CA",
    rating: 4.9,
    reviewCount: 127,
    isVerified: true,
    yearsExp: 8,
    coverImage: null,
    services: [
      { name: "Standard Home Cleaning", description: "Full home cleaning including all rooms, bathrooms, and kitchen", price: 55, duration: 180 },
      { name: "Deep Clean", description: "Intensive deep clean with appliances, baseboards, and inside cabinets", price: 90, duration: 300 },
      { name: "Move-In/Out Clean", description: "Thorough cleaning for move-in or move-out situations", price: 120, duration: 360 },
    ],
  },
  {
    name: "Marcus Chen",
    email: "marcus@example.com",
    bio: "Yale-educated math and science tutor helping students from middle school through college. I've helped 200+ students improve their grades and develop genuine love for learning.",
    category: "Tutoring",
    hourlyRate: 30,
    location: "New York, NY",
    rating: 4.8,
    reviewCount: 89,
    isVerified: true,
    yearsExp: 6,
    coverImage: null,
    services: [
      { name: "Math Tutoring", description: "Algebra, geometry, calculus, and statistics for all levels", price: 30, duration: 60 },
      { name: "Science Tutoring", description: "Physics, chemistry, and biology from middle school to AP level", price: 30, duration: 60 },
      { name: "SAT/ACT Prep", description: "Comprehensive test preparation with practice tests and strategies", price: 50, duration: 90 },
    ],
  },
  {
    name: "Amara Osei",
    email: "amara@example.com",
    bio: "Award-winning portrait and event photographer. My work has been featured in Vogue, Time, and National Geographic. I capture authentic moments with a timeless, editorial eye.",
    category: "Photography",
    hourlyRate: 60,
    location: "Los Angeles, CA",
    rating: 5.0,
    reviewCount: 214,
    isVerified: true,
    yearsExp: 12,
    coverImage: null,
    services: [
      { name: "Portrait Session", description: "1-hour studio or outdoor portrait session with 30 edited photos", price: 120, duration: 90 },
      { name: "Event Coverage", description: "Full event photography with unlimited photos, edited gallery delivered in 1 week", price: 250, duration: 240 },
      { name: "Brand Photography", description: "Professional branding photos for your business or personal brand", price: 200, duration: 180 },
    ],
  },
  {
    name: "Jordan Lee",
    email: "jordan@example.com",
    bio: "NASM-certified personal trainer and nutritionist. Former Division I athlete with a passion for helping clients achieve sustainable fitness transformations. Specializing in strength training and HIIT.",
    category: "Personal Training",
    hourlyRate: 35,
    location: "Chicago, IL",
    rating: 4.7,
    reviewCount: 156,
    isVerified: true,
    yearsExp: 9,
    coverImage: null,
    services: [
      { name: "1-on-1 Training Session", description: "Personalized workout session tailored to your goals and fitness level", price: 35, duration: 60 },
      { name: "Fitness Assessment", description: "Comprehensive fitness assessment including body composition and movement screening", price: 50, duration: 90 },
      { name: "Monthly Training Package", description: "8 sessions per month with nutrition guidance and progress tracking", price: 220, duration: 60 },
    ],
  },
  {
    name: "Elena Vasquez",
    email: "elena@example.com",
    bio: "Licensed master plumber serving residential and commercial clients. Available 24/7 for emergencies. Over 500 five-star reviews and a 100% satisfaction guarantee on all work.",
    category: "Plumbing",
    hourlyRate: 45,
    location: "Austin, TX",
    rating: 4.9,
    reviewCount: 312,
    isVerified: true,
    yearsExp: 15,
    coverImage: null,
    services: [
      { name: "Drain Cleaning", description: "Professional drain unclogging and cleaning for sinks, tubs, and toilets", price: 65, duration: 60 },
      { name: "Pipe Repair", description: "Leaking or broken pipe repair with guaranteed results", price: 95, duration: 90 },
      { name: "Water Heater Service", description: "Water heater inspection, repair, or replacement consultation", price: 80, duration: 120 },
    ],
  },
  {
    name: "David Park",
    email: "david@example.com",
    bio: "Certified electrician specializing in residential rewiring, smart home installation, and EV charger setup. Safety-first approach with clean, professional work every time.",
    category: "Electrical",
    hourlyRate: 50,
    location: "Seattle, WA",
    rating: 4.8,
    reviewCount: 98,
    isVerified: true,
    yearsExp: 10,
    coverImage: null,
    services: [
      { name: "Outlet Installation", description: "Safe installation of new electrical outlets, including GFCI", price: 75, duration: 90 },
      { name: "Smart Home Setup", description: "Smart lighting, switches, and device installation and configuration", price: 110, duration: 120 },
      { name: "EV Charger Installation", description: "Level 2 home EV charger installation with panel assessment", price: 180, duration: 180 },
    ],
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    bio: "Passionate gardener and landscape designer with a focus on native plants and sustainable practices. I transform outdoor spaces into thriving ecosystems that are beautiful and low-maintenance.",
    category: "Gardening",
    hourlyRate: 22,
    location: "Portland, OR",
    rating: 4.6,
    reviewCount: 74,
    isVerified: false,
    yearsExp: 5,
    coverImage: null,
    services: [
      { name: "Garden Maintenance", description: "Regular weeding, pruning, and plant care for your existing garden", price: 45, duration: 120 },
      { name: "Landscape Design", description: "Custom garden design plan with plant recommendations and layout", price: 120, duration: 180 },
      { name: "Lawn Care", description: "Mowing, edging, and lawn treatment for a lush, healthy yard", price: 35, duration: 90 },
    ],
  },
  {
    name: "Tyler Brooks",
    email: "tyler@example.com",
    bio: "Certified dog trainer and pet care specialist. I offer training classes, behavioral consultations, and loving pet sitting in my home. Your pet's happiness and safety are my top priority.",
    category: "Pet Care",
    hourlyRate: 15,
    location: "Denver, CO",
    rating: 4.9,
    reviewCount: 203,
    isVerified: true,
    yearsExp: 7,
    coverImage: null,
    services: [
      { name: "Dog Walking", description: "30-minute neighborhood walk with GPS tracking and photo updates", price: 12, duration: 30 },
      { name: "Pet Sitting", description: "In-home pet sitting, including feeding, playtime, and overnight stays", price: 35, duration: 480 },
      { name: "Training Session", description: "Private obedience or behavioral training session for your dog", price: 40, duration: 60 },
    ],
  },
];

async function seed() {
  console.log("Clearing existing data...");
  await db.delete(schema.availability);
  await db.delete(schema.reviews);
  await db.delete(schema.bookings);
  await db.delete(schema.services);
  await db.delete(schema.professionals);
  await db.delete(schema.authVerifications);
  await db.delete(schema.authAccounts);
  await db.delete(schema.authSessions);
  await db.delete(schema.users);
  console.log("Cleared. Seeding database...");

  for (const pro of professionalsData) {
    // Use Better Auth to create user (handles password hashing + authAccounts)
    const result = await auth.api.signUpEmail({
      body: {
        name: pro.name,
        email: pro.email,
        password: "password123",
        role: "PROFESSIONAL",
      },
    });

    const userId = result.user.id;

    // Update role to PROFESSIONAL in users table
    await db
      .update(schema.users)
      .set({ role: "PROFESSIONAL" })
      .where(eq(schema.users.id, userId));

    // Create professional profile
    const [professional] = await db
      .insert(schema.professionals)
      .values({
        userId,
        bio: pro.bio,
        category: pro.category,
        hourlyRate: pro.hourlyRate,
        location: pro.location,
        rating: pro.rating,
        reviewCount: pro.reviewCount,
        isVerified: pro.isVerified,
        yearsExp: pro.yearsExp,
        coverImage: pro.coverImage,
      })
      .returning();

    for (const service of pro.services) {
      await db.insert(schema.services).values({
        professionalId: professional.id,
        ...service,
      });
    }

    for (let day = 1; day <= 6; day++) {
      await db.insert(schema.availability).values({
        professionalId: professional.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
      });
    }

    console.log(`Created professional: ${pro.name}`);
  }

  // Customer
  await auth.api.signUpEmail({
    body: { name: "Alex Johnson", email: "customer@example.com", password: "password123", role: "CUSTOMER" },
  });
  console.log("Created customer: customer@example.com");

  // Admin
  const adminResult = await auth.api.signUpEmail({
    body: { name: "Admin User", email: "admin@example.com", password: "admin123", role: "ADMIN" },
  });
  await db
    .update(schema.users)
    .set({ role: "ADMIN" })
    .where(eq(schema.users.id, adminResult.user.id));
  console.log("Created admin: admin@example.com");

  console.log("\nSeed complete!");
  console.log("Customer:     customer@example.com / password123");
  console.log("Admin:        admin@example.com    / admin123");
  console.log("Professional: sofia@example.com    / password123");
  await connection.end();
}

seed().catch(console.error);
