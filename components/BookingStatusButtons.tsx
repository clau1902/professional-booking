"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Check, XCircle, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export function BookingStatusButtons({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    const res = await fetch(`/api/professional/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    if (res.ok) {
      const messages: Record<string, string> = {
        CONFIRMED: "Booking confirmed.",
        CANCELLED: "Booking declined.",
        COMPLETED: "Booking marked as complete.",
      };
      toast.success(messages[newStatus] ?? "Status updated.");
    } else {
      toast.error("Failed to update booking status. Please try again.");
    }
    router.refresh();
  }

  if (status === "PENDING") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => updateStatus("CONFIRMED")}
          disabled={loading !== null}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1"
        >
          {loading === "CONFIRMED" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Confirm
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus("CANCELLED")}
          disabled={loading !== null}
          className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl text-xs gap-1"
        >
          {loading === "CANCELLED" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
          Decline
        </Button>
      </div>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => updateStatus("COMPLETED")}
          disabled={loading !== null}
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs gap-1"
        >
          {loading === "COMPLETED" ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
          Mark complete
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus("CANCELLED")}
          disabled={loading !== null}
          className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl text-xs gap-1"
        >
          {loading === "CANCELLED" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
          Cancel
        </Button>
      </div>
    );
  }

  return null;
}
