"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";

export function AdminVerifyButton({
  professionalId,
  isVerified,
}: {
  professionalId: string;
  isVerified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/professionals/${professionalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !isVerified }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isVerified ? "Revoke verification" : "Verify professional"}
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
        isVerified
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
      }`}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isVerified ? (
        <ShieldCheck size={12} />
      ) : (
        <ShieldOff size={12} />
      )}
      {isVerified ? "Verified" : "Unverified"}
    </button>
  );
}
