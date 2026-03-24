"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

export function AddServiceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  function reset() {
    setName(""); setDescription(""); setPrice(""); setDuration("");
    setError(""); setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/professional/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, price, duration }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add service.");
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success("Service added successfully.");
    reset();
    router.refresh();
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl gap-1"
      >
        <Plus size={14} />
        Add service
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--cream)] border border-[var(--border)] rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-sm">New service</p>
        <button type="button" onClick={reset} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label className="text-xs font-medium">Service name *</Label>
          <Input
            placeholder="e.g. Deep cleaning session"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 rounded-xl h-10 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-medium">Description *</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="What's included in this service?"
            rows={2}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--terra)]"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Price ($) *</Label>
          <Input
            type="number" min="1" step="0.01" placeholder="60"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1 rounded-xl h-10 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Duration (minutes) *</Label>
          <Input
            type="number" min="15" step="15" placeholder="60"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="mt-1 rounded-xl h-10 text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={reset} className="rounded-xl">
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading}
          className="bg-[var(--terra)] text-white rounded-xl gap-1"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Add service
        </Button>
      </div>
    </form>
  );
}
