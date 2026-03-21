"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface Props {
  bookingId: string;
  professionalName: string;
}

export function ReviewButton({ bookingId, professionalName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!rating || !comment.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-[var(--terra)] text-white rounded-xl text-xs gap-1"
      >
        <Star size={11} />
        Review
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border border-[var(--border)]">
        <h2 className="font-display text-2xl font-semibold mb-1">Leave a review</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          How was your experience with <strong>{professionalName}</strong>?
        </p>

        {/* Star picker */}
        <div className="mb-6">
          <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
            Your rating
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={
                    star <= (hovered || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-[var(--border)]"
                  }
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
            Your review
          </p>
          <Textarea
            placeholder="Share your experience — what went well, what could be improved…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="rounded-2xl resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-2xl"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !rating || !comment.trim()}
            className="flex-1 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-2xl"
          >
            {loading ? "Submitting…" : "Submit review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
