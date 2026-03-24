# Handpicked

A full-stack marketplace for discovering and booking trusted local service professionals — cleaners, tutors, photographers, personal trainers, plumbers, and more.

## What it does

**For customers:**
- Browse and search professionals by category, location, price range, and availability
- View detailed profiles with bios, ratings, reviews, services offered, and weekly availability
- Book a service and pay securely via Stripe
- Cancel bookings and manage upcoming and past bookings from a personal dashboard
- Message professionals directly through the in-app conversation system

**For professionals:**
- Sign up as a professional and set up a profile with category, bio, hourly rate, location, and years of experience
- Add services with individual pricing and duration
- Set weekly availability (days and working hours)
- Manage incoming booking requests — confirm, complete, or cancel from a dashboard
- Upload a profile photo
- Edit profile details at any time

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| UI | Tailwind CSS v4, shadcn/ui, Lucide icons |
| Payments | Stripe |
| Email | Resend |
| Deployment | Docker + Docker Compose |

## Project structure

```
app/
  page.tsx               # Home page — search, featured pros, categories
  professionals/
    page.tsx             # Browse & filter all professionals
    [id]/page.tsx        # Individual professional profile
  book/[id]/page.tsx     # Booking flow
  dashboard/page.tsx     # Customer & professional dashboards
  auth/                  # Login, register, forgot password
  api/
    auth/                # Better Auth routes
    bookings/            # Create bookings; cancel via [id]/cancel
    professionals/       # Public professional listings
    professional/        # Pro-side profile, services, availability, bookings
    conversations/       # Messaging threads and messages
    reviews/             # Customer reviews
    stripe/              # Checkout session and webhook handler
    user/avatar/         # Profile photo upload
    admin/               # Admin user/professional management
    health/              # Health check endpoint

components/              # Shared UI components
db/
  schema.ts              # Drizzle schema (users, professionals, services, bookings, reviews, availability)
  migrations/            # SQL migration files (run automatically on startup)
  seed.ts                # Seed script with example professionals
lib/
  auth.ts                # Better Auth server config
  auth-client.ts         # Better Auth client config
  category.ts            # Category metadata (colors, gradients, emojis)
```

## Getting started

### Option A — Docker (recommended)

The easiest way to run the full stack (app + database + migrations) is with Docker Compose.

**1. Copy and fill in environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your secrets (see [Environment variables](#environment-variables)).

**2. Start all services**

```bash
docker compose up --build
```

This will:
- Start a PostgreSQL 16 database
- Run Drizzle migrations automatically
- Build and start the Next.js app on port 3001

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

### Option B — Local development

**1. Install dependencies**

```bash
npm install
```

**2. Set up environment variables**

Create a `.env` file in the project root (see [Environment variables](#environment-variables)).

**3. Set up the database**

```bash
# Push the schema to the database
npm run db:push

# (Optional) Seed with example professionals
npm run db:seed
```

**4. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

| Variable | Description |
|---|---|
| `POSTGRES_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth session signing |
| `BETTER_AUTH_URL` | Public base URL of the app (used by Better Auth) |
| `NEXT_PUBLIC_APP_URL` | Public base URL (used client-side) |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) for transactional email |
| `STRIPE_SECRET_KEY` | Stripe secret key (from Stripe dashboard) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (exposed to client) |

## Database commands

```bash
npm run db:generate   # Generate migration files from schema changes
npm run db:migrate    # Run pending migrations
npm run db:push       # Push schema directly to the database (dev)
npm run db:studio     # Open Drizzle Studio (visual DB browser)
npm run db:seed       # Seed the database with sample data
```

## User roles

The app has three roles set at registration:

- **Customer** — can browse, book, pay, cancel, review, and message professionals
- **Professional** — can create a profile, list services, set availability, manage bookings, and message customers
- **Admin** — redirected to `/admin` (admin panel)

## Key features

- **Stripe payments** — customers pay at booking; webhook handler confirms payment and triggers booking confirmation
- **Email notifications** — booking confirmations and updates sent via Resend
- **Booking cancellation** — customers can cancel bookings; professionals can also cancel or complete them
- **In-app messaging** — conversation threads between customers and professionals, accessible from the dashboard
- **Health check** — `GET /api/health` endpoint for Docker/uptime monitoring
- **Automatic migrations** — the `migrate` Docker Compose service runs Drizzle migrations before the app starts
