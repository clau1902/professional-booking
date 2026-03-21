"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate send
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  }

  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      {/* Hero */}
      <div className="bg-[var(--foreground)] text-[var(--cream)] py-20">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--cream)]/50 hover:text-[var(--cream)] text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--cream)]/40 mb-3">
            Support
          </p>
          <h1 className="font-display text-5xl font-light mb-4">Contact us</h1>
          <p className="text-[var(--cream)]/60 text-lg leading-relaxed">
            Have a question or need help? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--terra-light)] flex items-center justify-center mb-4">
                <Mail size={18} className="text-[var(--terra)]" />
              </div>
              <h3 className="font-semibold mb-1">Email us</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                For general enquiries and support.
              </p>
              <p className="text-sm font-medium text-[var(--terra)]">support@handpicked.com</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--terra-light)] flex items-center justify-center mb-4">
                <MessageSquare size={18} className="text-[var(--terra)]" />
              </div>
              <h3 className="font-semibold mb-1">Live chat</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Available on every page via the chat icon. Fastest way to get help.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--terra-light)] flex items-center justify-center mb-4">
                <Clock size={18} className="text-[var(--terra)]" />
              </div>
              <h3 className="font-semibold mb-1">Response time</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                We typically respond within 2–4 hours during business hours
                (Mon–Fri, 9 am–6 pm).
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="bg-white rounded-3xl p-12 border border-[var(--border)] text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={28} className="text-emerald-500" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-2">Message sent!</h2>
                <p className="text-[var(--muted-foreground)] mb-6">
                  Thanks for reaching out. We'll get back to you within 2–4 hours.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSent(false)}
                  className="rounded-xl"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-8 border border-[var(--border)] space-y-5"
              >
                <h2 className="font-display text-2xl font-semibold mb-6">Send us a message</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
                    <Input id="name" placeholder="Your name" required className="mt-1.5 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required className="mt-1.5 rounded-xl h-11" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required className="mt-1.5 rounded-xl h-11" />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question in as much detail as possible…"
                    rows={6}
                    required
                    className="mt-1.5 rounded-xl resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl text-base font-medium"
                >
                  {loading ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
