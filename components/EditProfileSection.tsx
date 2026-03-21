"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/EditProfileForm";
import { Pencil } from "lucide-react";

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
}

export function EditProfileSection({ profile, currentAvailability }: Props) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditing(true)}
        className="rounded-xl text-xs flex items-center gap-1.5"
      >
        <Pencil size={12} />
        Edit profile
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--border)] mb-6">
      <h3 className="font-display text-lg mb-5">Edit profile</h3>
      <EditProfileForm
        profile={profile}
        currentAvailability={currentAvailability}
        onCancel={() => setEditing(false)}
      />
    </div>
  );
}
