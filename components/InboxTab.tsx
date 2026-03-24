"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { MessagingModal } from "@/components/MessagingModal";
import { formatDistanceToNow } from "date-fns";

interface ConversationRow {
  id: string;
  otherName: string;
  updatedAt: Date;
  unreadCount: number;
}

interface Props {
  conversations: ConversationRow[];
  currentUserId: string;
}

export function InboxTab({ conversations, currentUserId }: Props) {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState("");

  function open(id: string, name: string) {
    setActiveConvId(id);
    setActiveName(name);
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-[var(--border)]">
        <MessageSquare size={32} className="mx-auto mb-4 text-[var(--muted-foreground)]" />
        <h3 className="font-display text-xl mb-1">No messages yet</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Your conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => open(conv.id, conv.otherName)}
            className="w-full bg-white rounded-2xl p-5 border border-[var(--border)] hover:border-[var(--terra)] transition-all text-left flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--cream-dark)] flex items-center justify-center font-semibold text-sm shrink-0">
              {conv.otherName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{conv.otherName}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
              </p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="bg-[var(--terra)] text-white text-xs px-2 py-0.5 rounded-full font-medium shrink-0">
                {conv.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeConvId && (
        <MessagingModal
          conversationId={activeConvId}
          currentUserId={currentUserId}
          otherName={activeName}
          onClose={() => setActiveConvId(null)}
        />
      )}
    </>
  );
}
