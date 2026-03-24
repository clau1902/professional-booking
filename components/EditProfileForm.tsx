"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, DollarSign, MapPin, Camera } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Cleaning",
  "Tutoring",
  "Photography",
  "Personal Training",
  "Plumbing",
  "Electrical",
  "Gardening",
  "Pet Care",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Props {
  profile: {
    bio: string;
    category: string;
    hourlyRate: number;
    location: string;
    yearsExp: number;
    avatarUrl?: string | null;
  };
  currentAvailability: AvailabilitySlot[];
  onCancel: () => void;
}

export function EditProfileForm({ profile, currentAvailability, onCancel }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl ?? null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState(profile.bio);
  const [category, setCategory] = useState(profile.category);
  const [hourlyRate, setHourlyRate] = useState(String(profile.hourlyRate));
  const [location, setLocation] = useState(profile.location);
  const [yearsExp, setYearsExp] = useState(String(profile.yearsExp));

  // Derive initial availability state
  const initialDays = currentAvailability.map((s) => s.dayOfWeek);
  const firstSlot = currentAvailability[0];
  const [selectedDays, setSelectedDays] = useState<number[]>(initialDays);
  const [startTime, setStartTime] = useState(firstSlot?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(firstSlot?.endTime ?? "17:00");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarData(result);
    };
    reader.readAsDataURL(file);
  }

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bio || !category || !hourlyRate || !location) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    const profileRes = await fetch("/api/professional/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, category, hourlyRate, location, yearsExp }),
    });

    if (!profileRes.ok) {
      const data = await profileRes.json();
      setError(data.error ?? "Failed to update profile.");
      setLoading(false);
      return;
    }

    // Upload avatar if changed
    if (avatarData) {
      await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarData }),
      });
    }

    const slots: AvailabilitySlot[] = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime,
      endTime,
    }));

    await fetch("/api/professional/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots }),
    });

    setLoading(false);
    toast.success("Profile updated successfully.");
    router.refresh();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo upload */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Profile photo</Label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--cream-dark)] border border-[var(--border)] shrink-0">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Preview" width={64} height={64} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
                <Camera size={20} />
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl text-xs"
            >
              {avatarPreview ? "Change photo" : "Upload photo"}
            </Button>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">JPG, PNG or WebP · max 2MB</p>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Category *</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mt-1.5 w-full h-12 rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--terra)]"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="edit-bio" className="text-sm font-medium">Bio *</Label>
        <textarea
          id="edit-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--terra)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-rate" className="text-sm font-medium flex items-center gap-1.5">
            <DollarSign size={13} />Hourly rate *
          </Label>
          <Input
            id="edit-rate"
            type="number"
            min="1"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
            className="mt-1.5 rounded-xl h-12"
          />
        </div>
        <div>
          <Label htmlFor="edit-years" className="text-sm font-medium flex items-center gap-1.5">
            <Clock size={13} />Years experience
          </Label>
          <Input
            id="edit-years"
            type="number"
            min="0"
            value={yearsExp}
            onChange={(e) => setYearsExp(e.target.value)}
            className="mt-1.5 rounded-xl h-12"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit-location" className="text-sm font-medium flex items-center gap-1.5">
          <MapPin size={13} />Location *
        </Label>
        <Input
          id="edit-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="mt-1.5 rounded-xl h-12"
        />
      </div>

      <div className="border-t border-[var(--border)] pt-5">
        <Label className="text-sm font-medium mb-3 block">Available days</Label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(i)}
              className={`w-12 h-12 rounded-xl text-sm font-medium border transition-colors ${
                selectedDays.includes(i)
                  ? "bg-[var(--terra)] text-white border-[var(--terra)]"
                  : "bg-white text-[var(--foreground)] border-[var(--border)] hover:border-[var(--terra)]"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="edit-start" className="text-sm font-medium flex items-center gap-1.5">
              <Clock size={13} />Start time
            </Label>
            <Input
              id="edit-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1.5 rounded-xl h-12"
            />
          </div>
          <div>
            <Label htmlFor="edit-end" className="text-sm font-medium flex items-center gap-1.5">
              <Clock size={13} />End time
            </Label>
            <Input
              id="edit-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1.5 rounded-xl h-12"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
