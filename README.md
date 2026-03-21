# Handpicked

A full-stack marketplace for discovering and booking trusted local service professionals — cleaners, tutors, photographers, personal trainers, plumbers, and more.

## What it does

**For customers:**
- Browse and search professionals by category, location, price range, and availability
- View detailed profiles with bios, ratings, reviews, services offered, and weekly availability
- Book a service and manage upcoming and past bookings from a personal dashboard

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
| Payments | Stripe (integrated) |

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
  api/                   # API routes (auth, bookings, professionals, services, availability)

components/              # Shared UI components
db/
  schema.ts              # Drizzle schema (users, professionals, services, bookings, reviews, availability)
  seed.ts                # Seed script with example professionals
lib/
  auth.ts                # Better Auth server config
  auth-client.ts         # Better Auth client config
  category.ts            # Category metadata (colors, gradients, emojis)
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/handpicked
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Set up the database

```bash
# Push the schema to the database
npm run db:push

# Seed with example professionals and data
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database commands

```bash
npm run db:generate   # Generate migration files from schema changes
npm run db:migrate    # Run migrations
npm run db:push       # Push schema directly to the database (dev)
npm run db:studio     # Open Drizzle Studio (visual DB browser)
npm run db:seed       # Seed the database with sample data
```

## User roles

The app has three roles set at registration:

- **Customer** — can browse, book, and review professionals
- **Professional** — can create a profile, list services, set availability, and manage bookings
- **Admin** — redirected to `/admin` (admin panel)
