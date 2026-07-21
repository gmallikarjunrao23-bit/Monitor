"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm Pulse — ask me anything about setting up monitors, alerts, or your account. 👋" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: newMessages.slice(-6) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection hiccup — try again?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-signal text-bg shadow-card-hover transition-transform hover:scale-105"
        >
          <MessageCircle size={20} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 flex h-[480px] w-80 flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card-hover animate-fade-up">
          <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-signal/15">
                <Sparkles size={13} className="text-signal" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Pulse</p>
                <p className="text-[10px] text-text-muted">AI Support</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-md px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-signal/15 text-text-primary"
                      : "bg-bg border border-border-subtle text-text-secondary"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-md border border-border-subtle bg-bg px-3 py-2 text-xs text-text-muted">
                  Pulse is typing...
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border-subtle p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Pulse anything..."
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-signal"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-signal text-bg hover:opacity-90 disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
