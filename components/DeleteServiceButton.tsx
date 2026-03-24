"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this service? Existing bookings won't be affected.")) return;
    setLoading(true);
    const res = await fetch(`/api/professional/services/${serviceId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      toast.success("Service deleted.");
    } else {
      toast.error("Failed to delete service. Please try again.");
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[var(--muted-foreground)] hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete service"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
