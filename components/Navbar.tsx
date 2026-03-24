"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

const CATEGORIES = [
  { name: "Cleaning",          emoji: "🧹" },
  { name: "Tutoring",          emoji: "📚" },
  { name: "Photography",       emoji: "📷" },
  { name: "Personal Training", emoji: "💪" },
  { name: "Plumbing",          emoji: "🔧" },
  { name: "Electrical",        emoji: "⚡" },
  { name: "Gardening",         emoji: "🌿" },
  { name: "Pet Care",          emoji: "🐾" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileCategories, setMobileCategories] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/auth")) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[var(--cream)]/95 backdrop-blur-md ${
        scrolled ? "shadow-sm border-b border-[var(--border)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="w-7 h-7 rounded-full bg-[var(--terra)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">H</span>
          </span>
          <span className="font-display text-xl font-semibold tracking-wide text-[var(--foreground)] group-hover:text-[var(--terra)] transition-colors">
            Handpicked
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/professionals"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith("/professionals") || pathname.startsWith("/book")
                ? "text-[var(--terra)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Browse all
          </Link>

          {/* Categories dropdown */}
          <div className="relative" ref={catRef}>
            <button
              onClick={() => setCatOpen(!catOpen)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors outline-none ${
                pathname.startsWith("/professionals") || pathname.startsWith("/book")
                  ? "text-[var(--terra)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Categories
              <ChevronDown size={14} className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
            </button>

            {catOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--cream)] rounded-2xl shadow-lg border border-[var(--border)] p-2 z-50">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.name}
                    href={`/professionals?category=${encodeURIComponent(cat.name)}`}
                    onClick={() => setCatOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--terra-light)] hover:text-[var(--terra)] transition-colors"
                  >
                    <span className="text-base">{cat.emoji}</span>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "text-[var(--terra)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            My bookings
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors outline-none"
              >
                <span className="w-7 h-7 rounded-full bg-[var(--terra)] flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </span>
                <span className="max-w-[120px] truncate">{user.name?.split(" ")[0]}</span>
                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--cream)] rounded-2xl shadow-lg border border-[var(--border)] p-2 z-50">
                  <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)] mb-1 truncate">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--terra-light)] hover:text-[var(--terra)] transition-colors"
                  >
                    <User size={14} />
                    My bookings
                  </Link>
                  {confirmSignOut ? (
                    <div className="px-3 py-2 space-y-1.5">
                      <p className="text-xs text-[var(--muted-foreground)]">Sign out?</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); setConfirmSignOut(false); }}
                          className="flex-1 py-1.5 rounded-lg text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          Yes, sign out
                        </button>
                        <button
                          onClick={() => setConfirmSignOut(false)}
                          className="flex-1 py-1.5 rounded-lg text-xs border border-[var(--border)] hover:bg-[var(--cream-dark)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmSignOut(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--foreground)] hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--foreground)] hover:bg-[var(--cream-dark)]"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="sm"
                  className="bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-full px-5"
                >
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[var(--cream)] border-t border-[var(--border)] px-6 py-4 flex flex-col gap-2">
          <Link
            href="/professionals"
            className="text-sm font-medium py-2"
            onClick={() => setOpen(false)}
          >
            Browse all
          </Link>

          {/* Mobile categories toggle */}
          <button
            className="flex items-center justify-between text-sm font-medium py-2 w-full"
            onClick={() => setMobileCategories(!mobileCategories)}
          >
            Categories
            <ChevronDown
              size={14}
              className={`transition-transform ${mobileCategories ? "rotate-180" : ""}`}
            />
          </button>
          {mobileCategories && (
            <div className="pl-3 flex flex-col gap-1 mb-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/professionals?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] py-1.5"
                  onClick={() => setOpen(false)}
                >
                  <span>{cat.emoji}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/dashboard"
            className="text-sm font-medium py-2"
            onClick={() => setOpen(false)}
          >
            My bookings
          </Link>

          <hr className="border-[var(--border)] my-1" />
          {user ? (
            <>
              <div className="px-2 py-1 text-xs text-[var(--muted-foreground)]">{user.email}</div>
              {confirmSignOut ? (
                <div className="py-2 space-y-2">
                  <p className="text-xs text-[var(--muted-foreground)]">Are you sure you want to sign out?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { signOut(); setOpen(false); setConfirmSignOut(false); }}
                      className="flex-1 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Yes, sign out
                    </button>
                    <button
                      onClick={() => setConfirmSignOut(false)}
                      className="flex-1 py-2 rounded-xl text-sm border border-[var(--border)] hover:bg-[var(--cream-dark)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmSignOut(true)}
                  className="flex items-center gap-2 text-sm font-medium py-2 text-red-600 w-full"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              )}
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">Sign in</Button>
              </Link>
              <Link href="/auth/register" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full bg-[var(--terra)] text-white rounded-full">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
