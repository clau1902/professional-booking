export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { bookings, professionals, services, users } from "@/db/schema";
import { eq, desc, count, sum } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, ShieldCheck, Users, Briefcase, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { DashboardLogout } from "@/components/DashboardLogout";
import { AdminVerifyButton } from "@/components/AdminVerifyButton";
import { AdminRoleSelect } from "@/components/AdminRoleSelect";

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login?callbackUrl=/admin");

  const [adminUser] = await db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (adminUser?.role !== "ADMIN") redirect("/dashboard");

  // Fetch all data in parallel
  const [allUsers, allProfessionals, recentBookings, statsRows] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt)),

    db
      .select({
        id: professionals.id,
        userId: professionals.userId,
        category: professionals.category,
        location: professionals.location,
        hourlyRate: professionals.hourlyRate,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        isVerified: professionals.isVerified,
        isAvailable: professionals.isAvailable,
        createdAt: professionals.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .orderBy(desc(professionals.createdAt)),

    db
      .select({
        id: bookings.id,
        date: bookings.date,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        createdAt: bookings.createdAt,
        serviceName: services.name,
        customerName: users.name,
        professionalName: users.name,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(users, eq(bookings.customerId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(50),

    db
      .select({ totalRevenue: sum(bookings.totalPrice) })
      .from(bookings)
      .where(eq(bookings.status, "COMPLETED")),
  ]);

  const totalRevenue = Number(statsRows[0]?.totalRevenue ?? 0);
  const pendingBookings = recentBookings.filter((b) => b.status === "PENDING").length;
  const unverifiedPros = allProfessionals.filter((p) => !p.isVerified).length;

  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[var(--terra)] mb-2">
              Admin Panel
            </p>
            <h1 className="font-display text-4xl font-light">Handpicked Dashboard</h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Signed in as {adminUser.name}
            </p>
          </div>
          <DashboardLogout />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Users,     label: "Total users",        value: allUsers.length },
            { icon: Briefcase, label: "Professionals",      value: allProfessionals.length },
            { icon: BookOpen,  label: "Bookings (recent)",  value: recentBookings.length },
            { icon: ShieldCheck, label: "Total revenue",    value: `$${totalRevenue.toFixed(0)}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-[var(--border)]">
              <Icon size={16} className="text-[var(--terra)] mb-2" />
              <p className="font-display text-3xl font-light mb-1">{value}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {(pendingBookings > 0 || unverifiedPros > 0) && (
          <div className="flex flex-wrap gap-3 mb-8">
            {unverifiedPros > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
                <ShieldCheck size={15} />
                <span><strong>{unverifiedPros}</strong> professional{unverifiedPros > 1 ? "s" : ""} awaiting verification</span>
              </div>
            )}
            {pendingBookings > 0 && (
              <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-sm text-sky-700">
                <Clock size={15} />
                <span><strong>{pendingBookings}</strong> pending booking{pendingBookings > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="professionals">
          <TabsList className="bg-[var(--cream-dark)] rounded-2xl p-1 mb-6">
            <TabsTrigger value="professionals" className="rounded-xl">
              Professionals
              {unverifiedPros > 0 && (
                <span className="ml-1.5 bg-[var(--terra)] text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unverifiedPros}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl">
              Users ({allUsers.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-xl">
              Bookings
            </TabsTrigger>
          </TabsList>

          {/* ── Professionals ── */}
          <TabsContent value="professionals">
            <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--cream)]">
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide hidden md:table-cell">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide hidden lg:table-cell">Location</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide hidden md:table-cell">Rating</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allProfessionals.map((pro, i) => (
                    <tr
                      key={pro.id}
                      className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--cream)] transition-colors ${
                        !pro.isVerified ? "bg-amber-50/30" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{pro.userName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{pro.userEmail}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-[var(--muted-foreground)]">
                        {pro.category}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-[var(--muted-foreground)]">
                        {pro.location}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm">★ {pro.rating.toFixed(1)}</span>
                        <span className="text-xs text-[var(--muted-foreground)] ml-1">({pro.reviewCount})</span>
                      </td>
                      <td className="px-5 py-4">
                        <AdminVerifyButton
                          professionalId={pro.id}
                          isVerified={pro.isVerified}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/professionals/${pro.id}`}
                          className="text-xs text-[var(--terra)] hover:underline"
                        >
                          View profile →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allProfessionals.length === 0 && (
                <p className="text-center text-[var(--muted-foreground)] py-12 text-sm">
                  No professionals yet.
                </p>
              )}
            </div>
          </TabsContent>

          {/* ── Users ── */}
          <TabsContent value="users">
            <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--cream)]">
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide hidden md:table-cell">Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--cream)] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-xs text-[var(--muted-foreground)]">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-5 py-4">
                        <AdminRoleSelect
                          userId={user.id}
                          currentRole={user.role}
                          selfId={adminUser.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ── Bookings ── */}
          <TabsContent value="bookings">
            <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--cream)]">
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Service</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide hidden md:table-cell">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--cream)] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{booking.serviceName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          #{booking.id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-[var(--muted-foreground)]">
                        {booking.customerName}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-xs text-[var(--muted-foreground)]">
                        {format(new Date(booking.date), "MMM d, yyyy · h:mm a")}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`text-xs border ${STATUS_STYLES[booking.status] ?? ""}`}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 font-medium">
                        ${booking.totalPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentBookings.length === 0 && (
                <p className="text-center text-[var(--muted-foreground)] py-12 text-sm">
                  No bookings yet.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
