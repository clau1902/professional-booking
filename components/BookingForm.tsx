"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const [startH] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);
  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    const period = h < 12 ? "AM" : "PM";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    slots.push(`${displayH}:00 ${period}`);
  }
  return slots;
}

const DEFAULT_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface Props {
  professional: {
    id: string;
    userName: string;
    hourlyRate: number;
  };
  services: Service[];
  selectedServiceId?: string;
  availability?: AvailabilitySlot[];
}

type Step = "service" | "datetime" | "details" | "confirm" | "success";

export function BookingForm({ professional, services, selectedServiceId, availability = [] }: Props) {
  // Build a map of dayOfWeek → slot for quick lookup
  const availabilityByDay = new Map(availability.map((a) => [a.dayOfWeek, a]));
  const hasAvailability = availability.length > 0;
  const router = useRouter();
  const [step, setStep] = useState<Step>(selectedServiceId ? "datetime" : "service");
  const [selectedService, setSelectedService] = useState<Service | undefined>(
    services.find((s) => s.id === selectedServiceId) ?? services[0]
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [recurringCount, setRecurringCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps: Step[] = ["service", "datetime", "details", "confirm"];
  const stepLabels = ["Service", "Date & Time", "Details", "Confirm"];
  const currentStepIndex = steps.indexOf(step);

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setLoading(true);
    setError("");

    try {
      const [timePart, period] = selectedTime.split(" ");
      let [hours] = timePart.split(":").map(Number);
      const [, minutes] = timePart.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(hours, minutes, 0, 0);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: professional.id,
          serviceId: selectedService.id,
          date: bookingDate.toISOString(),
          notes,
          ...(recurringEnabled && {
            recurringPattern,
            recurringCount,
          }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Booking failed. Please sign in first.");
        setLoading(false);
        return;
      }

      const { url } = await res.json();
      window.location.href = url; // redirect to Stripe Checkout
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[var(--border)] text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-emerald-500" />
        </div>
        <h2 className="font-display text-3xl font-semibold mb-3">Booking confirmed!</h2>
        <p className="text-[var(--muted-foreground)] mb-2">
          Your session with <strong>{professional.userName}</strong> has been requested.
        </p>
        {selectedDate && selectedTime && (
          <p className="font-medium mb-6">
            {format(selectedDate, "EEEE, MMMM d")} at {selectedTime}
          </p>
        )}
        <p className="text-sm text-[var(--muted-foreground)] mb-8">
          You&apos;ll receive a confirmation email once the professional accepts.
          Typically within 2 hours.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl"
          >
            View my bookings
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/professionals")}
            className="rounded-xl"
          >
            Browse more
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] overflow-hidden">
      {/* Step indicators */}
      <div className="flex border-b border-[var(--border)]">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex-1 py-4 text-center text-xs font-medium transition-colors ${
              i === currentStepIndex
                ? "bg-[var(--terra)] text-white"
                : i < currentStepIndex
                ? "bg-[var(--terra-light)] text-[var(--terra)]"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            <span className="hidden sm:inline">{stepLabels[i]}</span>
            <span className="sm:hidden">{i + 1}</span>
          </div>
        ))}
      </div>

      <div className="p-8">
        {/* Step 1: Select service */}
        {step === "service" && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">Choose a service</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    selectedService?.id === service.id
                      ? "border-[var(--terra)] bg-[var(--terra-light)]"
                      : "border-[var(--border)] hover:border-[var(--terra)]/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold mb-1">{service.name}</p>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {service.description}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        {service.duration} minutes
                      </p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="font-display text-xl font-semibold">${service.price}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button
              onClick={() => setStep("datetime")}
              disabled={!selectedService}
              className="mt-6 w-full bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-2xl py-6"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === "datetime" && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">Pick a date & time</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3 block">
                  Select date
                </Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => { setSelectedDate(date); setSelectedTime(""); }}
                  disabled={(date) => {
                    if (isBefore(date, startOfDay(new Date()))) return true;
                    if (hasAvailability) return !availabilityByDay.has(date.getDay());
                    return date.getDay() === 0; // fallback: disable Sundays only
                  }}
                  className="rounded-2xl border border-[var(--border)] p-3"
                />
                {hasAvailability && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">
                    Only days the professional is available are selectable.
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3 block">
                  Select time
                </Label>
                {selectedDate ? (() => {
                  const daySlot = availabilityByDay.get(selectedDate.getDay());
                  const slots = daySlot
                    ? generateTimeSlots(daySlot.startTime, daySlot.endTime)
                    : DEFAULT_SLOTS;
                  return (
                    <>
                      {daySlot && (
                        <p className="text-xs text-[var(--muted-foreground)] mb-3">
                          Available {daySlot.startTime} – {daySlot.endTime}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 px-4 rounded-xl text-sm border transition-all ${
                              selectedTime === time
                                ? "bg-[var(--terra)] text-white border-[var(--terra)]"
                                : "border-[var(--border)] hover:border-[var(--terra)]"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })() : (
                  <div className="flex items-center justify-center h-32 text-sm text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-2xl">
                    Select a date first
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setStep("service")}
                className="flex-1 rounded-2xl"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("details")}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-2xl py-6"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === "details" && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">Any special requests?</h2>
            <div className="mb-6">
              <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3 block">
                Notes for {professional.userName} (optional)
              </Label>
              <Textarea
                placeholder="Describe any specific needs, access instructions, or preferences…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="rounded-2xl resize-none"
              />
            </div>

            {/* Recurring toggle */}
            <div className="mb-6 rounded-2xl border border-[var(--border)] overflow-hidden">
              <button
                type="button"
                onClick={() => setRecurringEnabled(!recurringEnabled)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                  recurringEnabled ? "bg-violet-50" : "hover:bg-[var(--cream)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    recurringEnabled ? "bg-violet-100" : "bg-[var(--cream-dark)]"
                  }`}>
                    <RefreshCw size={15} className={recurringEnabled ? "text-violet-600" : "text-[var(--muted-foreground)]"} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Repeat this booking</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Book multiple sessions at a discount</p>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors relative ${recurringEnabled ? "bg-violet-500" : "bg-[var(--border)]"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${recurringEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </button>

              {recurringEnabled && (
                <div className="px-4 pb-4 pt-2 bg-violet-50 border-t border-violet-100 space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
                      Frequency
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["weekly", "biweekly", "monthly"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setRecurringPattern(p)}
                          className={`py-2 rounded-xl text-sm border transition-all capitalize ${
                            recurringPattern === p
                              ? "bg-violet-500 text-white border-violet-500"
                              : "bg-white border-[var(--border)] hover:border-violet-300"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
                      Sessions — {recurringCount}
                    </Label>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={recurringCount}
                      onChange={(e) => setRecurringCount(Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                      <span>2</span>
                      <span className="text-violet-600 font-medium">
                        Total: ${((selectedService?.price ?? 0) * recurringCount).toFixed(0)}
                      </span>
                      <span>12</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("datetime")}
                className="flex-1 rounded-2xl"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                className="flex-1 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-2xl py-6"
              >
                Review booking
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === "confirm" && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">Confirm your booking</h2>

            <div className="bg-[var(--cream)] rounded-2xl p-6 mb-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Professional</span>
                <span className="font-medium">{professional.userName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Date</span>
                <span className="font-medium">
                  {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Duration</span>
                <span className="font-medium">{selectedService?.duration} minutes</span>
              </div>
              {notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Notes</span>
                  <span className="font-medium text-right max-w-[200px]">{notes}</span>
                </div>
              )}
              {recurringEnabled && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Repeat</span>
                    <span className="font-medium capitalize">{recurringPattern} · {recurringCount} sessions</span>
                  </div>
                </>
              )}
              <hr className="border-[var(--border)]" />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-semibold">
                  ${recurringEnabled
                    ? ((selectedService?.price ?? 0) * recurringCount).toFixed(0)
                    : selectedService?.price}
                </span>
              </div>
              {recurringEnabled && (
                <p className="text-xs text-[var(--muted-foreground)] text-right">
                  ${selectedService?.price}/session × {recurringCount} sessions
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("details")}
                className="flex-1 rounded-2xl"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-2xl py-6 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Booking…
                  </>
                ) : (
                  "Pay with Stripe →"
                )}
              </Button>
            </div>
            <p className="text-center text-xs text-[var(--muted-foreground)] mt-3">
              You&apos;ll be taken to Stripe&apos;s secure checkout to complete payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
