"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { MessagingModal } from "@/components/MessagingModal";

interface Props {
  professionalId: string;
  professionalName: string;
  currentUserId?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

export function MessageButton({
  professionalId,
  professionalName,
  currentUserId,
  variant = "outline",
  size = "default",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  async function handleClick() {
    if (!currentUserId) {
      router.push("/auth/login?callbackUrl=/professionals");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professionalId }),
    });
    setLoading(false);
    if (res.ok) {
      const { id } = await res.json();
      setConversationId(id);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={loading}
        className={`gap-2 rounded-2xl ${size === "sm" ? "text-xs rounded-xl" : ""}`}
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : <MessageSquare size={14} />
        }
        Message
      </Button>

      {conversationId && (
        <MessagingModal
          conversationId={conversationId}
          currentUserId={currentUserId!}
          otherName={professionalName}
          onClose={() => setConversationId(null)}
        />
      )}
    </>
  );
}
