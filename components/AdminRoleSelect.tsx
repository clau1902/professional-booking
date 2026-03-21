"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ROLES = ["CUSTOMER", "PROFESSIONAL", "ADMIN"] as const;

export function AdminRoleSelect({
  userId,
  currentRole,
  selfId,
}: {
  userId: string;
  currentRole: string;
  selfId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isSelf = userId === selfId;

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    if (newRole === currentRole) return;
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setLoading(false);
    router.refresh();
  }

  const roleColors: Record<string, string> = {
    CUSTOMER:     "text-sky-700 bg-sky-50 border-sky-200",
    PROFESSIONAL: "text-violet-700 bg-violet-50 border-violet-200",
    ADMIN:        "text-amber-700 bg-amber-50 border-amber-200",
  };

  return (
    <div className="flex items-center gap-1.5">
      {loading && <Loader2 size={12} className="animate-spin text-[var(--muted-foreground)]" />}
      <select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={loading || isSelf}
        className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none ${
          roleColors[currentRole] ?? "bg-gray-50 border-gray-200"
        }`}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {isSelf && (
        <span className="text-xs text-[var(--muted-foreground)]">(you)</span>
      )}
    </div>
  );
}
