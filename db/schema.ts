import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  real,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["CUSTOMER", "PROFESSIONAL", "ADMIN"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);

// Users
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  password: text("password"),  // optional — Better Auth stores it in `account`
  role: userRoleEnum("role").notNull().default("CUSTOMER"),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Professionals
export const professionals = pgTable("professionals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  hourlyRate: real("hourly_rate").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  yearsExp: integer("years_exp").notNull().default(0),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Services
export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  professionalId: text("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  duration: integer("duration").notNull(), // minutes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bookings
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id").notNull().references(() => users.id),
  professionalId: text("professional_id").notNull().references(() => professionals.id),
  serviceId: text("service_id").notNull().references(() => services.id),
  date: timestamp("date").notNull(),
  status: bookingStatusEnum("status").notNull().default("PENDING"),
  notes: text("notes"),
  totalPrice: real("total_price").notNull(),
  stripeSessionId: text("stripe_session_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id").notNull().unique().references(() => bookings.id),
  professionalId: text("professional_id").notNull().references(() => professionals.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Availability
export const availability = pgTable("availability", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  professionalId: text("professional_id").notNull().references(() => professionals.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  startTime: varchar("start_time", { length: 10 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 10 }).notNull(),   // "17:00"
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  professional: one(professionals, { fields: [users.id], references: [professionals.userId] }),
  bookings: many(bookings),
}));

export const professionalsRelations = relations(professionals, ({ one, many }) => ({
  user: one(users, { fields: [professionals.userId], references: [users.id] }),
  services: many(services),
  bookings: many(bookings),
  reviews: many(reviews),
  availability: many(availability),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  professional: one(professionals, { fields: [services.professionalId], references: [professionals.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, { fields: [bookings.customerId], references: [users.id] }),
  professional: one(professionals, { fields: [bookings.professionalId], references: [professionals.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  review: one(reviews, { fields: [bookings.id], references: [reviews.bookingId] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
  professional: one(professionals, { fields: [reviews.professionalId], references: [professionals.id] }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  professional: one(professionals, { fields: [availability.professionalId], references: [professionals.id] }),
}));

// Types
export type User = typeof users.$inferSelect;
export type Professional = typeof professionals.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Availability = typeof availability.$inferSelect;

// ─── Better Auth tables ────────────────────────────────────────────────────

export const authSessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const authAccounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const authVerifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);
