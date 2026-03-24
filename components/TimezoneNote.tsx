"use client";

export function TimezoneNote() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <p className="text-xs text-[var(--muted-foreground)] mt-3">
      Times shown in the professional&apos;s local timezone ({tz}).
    </p>
  );
}
