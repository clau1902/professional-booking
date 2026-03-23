"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  createdAt: string;
}

interface Props {
  conversationId: string;
  currentUserId: string;
  otherName: string;
  onClose: () => void;
}

export function MessagingModal({ conversationId, currentUserId, otherName, onClose }: Props) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMsgs(data);
    }
  }, [conversationId]);

  useEffect(() => {
    const load = async () => {
      await fetchMessages();
      setLoading(false);
    };
    void load();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function sendMessage() {
    if (!content.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSending(false);
    if (res.ok) {
      setContent("");
      fetchMessages();
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl flex flex-col shadow-xl border border-[var(--border)] h-[90vh] sm:h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <div>
            <p className="font-semibold">{otherName}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Messages are private</p>
          </div>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : msgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-display text-lg mb-1">No messages yet</p>
              <p className="text-sm text-[var(--muted-foreground)]">Send a message to get the conversation started.</p>
            </div>
          ) : (
            msgs.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 rounded-full bg-[var(--cream-dark)] flex items-center justify-center text-xs font-semibold shrink-0 mt-1">
                    {msg.senderName[0].toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-[var(--terra)] text-white rounded-tr-sm"
                        : "bg-[var(--cream-dark)] text-[var(--foreground)] rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] px-1">
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-[var(--border)] shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-[var(--terra)] transition-colors min-h-[44px] max-h-32"
              style={{ height: "auto" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!content.trim() || sending}
              size="sm"
              className="bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-2xl h-11 w-11 p-0 shrink-0"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
