"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function CancelBookingButton({
  bookingId,
  serviceName,
  professionalName,
  recurringGroupId,
}: {
  bookingId: string;
  serviceName: string;
  professionalName: string;
  recurringGroupId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel(cancelSeries = false) {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelSeries }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      toast.error("Failed to cancel booking. Please try again.");
      return;
    }

    setOpen(false);
    toast.success(cancelSeries ? "All sessions in the series cancelled." : "Booking cancelled successfully.");
    router.refresh();
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-xl text-xs text-red-600 border-red-200 hover:bg-red-50"
      >
        <X size={11} className="mr-1" />
        Cancel
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) setOpen(false); }}
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border border-[var(--border)]">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-2">Cancel booking?</h2>
        <p className="text-[var(--muted-foreground)] text-sm mb-2">
          You&apos;re about to cancel your <strong>{serviceName}</strong> session with{" "}
          <strong>{professionalName}</strong>.
        </p>
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 mb-6">
          A full refund will be issued to your original payment method within 5–10 business days.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {recurringGroupId && (
            <Button
              onClick={() => handleCancel(true)}
              disabled={loading}
              variant="outline"
              className="w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50 gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={15} />}
              Cancel entire series
            </Button>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 rounded-2xl"
            >
              Keep booking
            </Button>
            <Button
              onClick={() => handleCancel(false)}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Yes, cancel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
