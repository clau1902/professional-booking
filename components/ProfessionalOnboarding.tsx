"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, DollarSign, MapPin } from "lucide-react";

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

export function ProfessionalOnboarding({ userName: _userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: profile
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExp, setYearsExp] = useState("");

  // Step 2: first service
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");

  // Step 3: availability
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bio || !category || !hourlyRate || !location) {
      setError("Please fill in all required fields.");
      return;
    }
    setStep(2);
    setError("");
  }

  async function handleServiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceName || !serviceDesc || !servicePrice || !serviceDuration) {
      setError("Please fill in all service fields.");
      return;
    }
    setStep(3);
    setError("");
  }

  async function handleAvailabilitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Create profile
    const profileRes = await fetch("/api/professional/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, category, hourlyRate, location, yearsExp }),
    });

    if (!profileRes.ok) {
      const data = await profileRes.json();
      setError(data.error ?? "Failed to create profile.");
      setLoading(false);
      return;
    }

    // Create first service
    const serviceRes = await fetch("/api/professional/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: serviceName,
        description: serviceDesc,
        price: servicePrice,
        duration: serviceDuration,
      }),
    });

    if (!serviceRes.ok) {
      const data = await serviceRes.json();
      setError(data.error ?? "Failed to create service.");
      setLoading(false);
      return;
    }

    // Save availability (optional — skip if no days selected)
    if (selectedDays.length > 0) {
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
    }

    router.refresh();
  }

  const stepLabels = ["Your profile", "Your first service", "Availability"];

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s
                  ? "bg-[var(--terra)] text-white"
                  : "bg-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-px w-12 transition-colors ${
                  step > s ? "bg-[var(--terra)]" : "bg-[var(--border)]"
                }`}
              />
            )}
          </div>
        ))}
        <span className="text-sm text-[var(--muted-foreground)] ml-2">
          {stepLabels[step - 1]}
        </span>
      </div>

      {step === 1 && (
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <Label className="text-sm font-medium">Category *</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="mt-1.5 w-full h-12 rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--terra)]"
            >
              <option value="">Select your specialty…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="bio" className="text-sm font-medium">Bio *</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              placeholder="Tell customers about yourself, your experience, and what makes you great at your work…"
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--terra)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate" className="text-sm font-medium flex items-center gap-1.5">
                <DollarSign size={13} />Hourly rate *
              </Label>
              <Input
                id="rate"
                type="number"
                min="1"
                step="0.01"
                placeholder="45"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
                className="mt-1.5 rounded-xl h-12"
              />
            </div>
            <div>
              <Label htmlFor="years" className="text-sm font-medium flex items-center gap-1.5">
                <Clock size={13} />Years experience
              </Label>
              <Input
                id="years"
                type="number"
                min="0"
                placeholder="3"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
                className="mt-1.5 rounded-xl h-12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1.5">
              <MapPin size={13} />Location *
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Austin, TX"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1.5 rounded-xl h-12"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl text-base"
          >
            Continue →
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleServiceSubmit} className="space-y-5">
          <p className="text-sm text-[var(--muted-foreground)] -mt-2 mb-4">
            Add your first service. You can add more from your dashboard later.
          </p>

          <div>
            <Label htmlFor="sname" className="text-sm font-medium">Service name *</Label>
            <Input
              id="sname"
              placeholder={`e.g. ${category} Session`}
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
              className="mt-1.5 rounded-xl h-12"
            />
          </div>

          <div>
            <Label htmlFor="sdesc" className="text-sm font-medium">Description *</Label>
            <textarea
              id="sdesc"
              value={serviceDesc}
              onChange={(e) => setServiceDesc(e.target.value)}
              required
              placeholder="What does this service include?"
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--terra)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sprice" className="text-sm font-medium flex items-center gap-1.5">
                <DollarSign size={13} />Price *
              </Label>
              <Input
                id="sprice"
                type="number"
                min="1"
                step="0.01"
                placeholder="60"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                required
                className="mt-1.5 rounded-xl h-12"
              />
            </div>
            <div>
              <Label htmlFor="sduration" className="text-sm font-medium flex items-center gap-1.5">
                <Clock size={13} />Duration (min) *
              </Label>
              <Input
                id="sduration"
                type="number"
                min="15"
                step="15"
                placeholder="60"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
                required
                className="mt-1.5 rounded-xl h-12"
              />
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
              onClick={() => { setStep(1); setError(""); }}
              className="flex-1 h-12 rounded-xl"
            >
              ← Back
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl"
            >
              Continue →
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleAvailabilitySubmit} className="space-y-6">
          <p className="text-sm text-[var(--muted-foreground)] -mt-2">
            Select the days you're available and your typical working hours. You can skip this and set it later.
          </p>

          <div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start" className="text-sm font-medium flex items-center gap-1.5">
                <Clock size={13} />Start time
              </Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1.5 rounded-xl h-12"
              />
            </div>
            <div>
              <Label htmlFor="end" className="text-sm font-medium flex items-center gap-1.5">
                <Clock size={13} />End time
              </Label>
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1.5 rounded-xl h-12"
              />
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
              onClick={() => { setStep(2); setError(""); }}
              className="flex-1 h-12 rounded-xl"
            >
              ← Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Launch my profile"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
