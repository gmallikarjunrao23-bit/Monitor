"use client";

import { useEffect, useState, useCallback } from "react";
import { Mail, MessageSquare, Webhook, Plus } from "lucide-react";

interface Channel {
  id: string;
  type: string;
  target: string;
  isActive: boolean;
}

const ICONS: Record<string, any> = { EMAIL: Mail, TELEGRAM: MessageSquare, WEBHOOK: Webhook };

export default function SettingsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("EMAIL");
  const [target, setTarget] = useState("");

  const fetchChannels = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setChannels(data.channels ?? []);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, target }),
    });
    if (res.ok) {
      setTarget("");
      setShowForm(false);
      fetchChannels();
    }
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">Manage notification channels</p>

      <div className="mt-8 max-w-lg space-y-3">
        {channels.map((c) => {
          const Icon = ICONS[c.type] ?? Mail;
          return (
            <div key={c.id} className="flex items-center justify-between rounded-card border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-white/5 p-2"><Icon size={16} className="text-text-secondary" /></div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{c.type}</p>
                  <p className="text-xs text-text-muted">{c.target}</p>
                </div>
              </div>
              <span className="text-xs text-signal">Active</span>
            </div>
          );
        })}

        {showForm ? (
          <form onSubmit={handleAdd} className="rounded-card border border-border bg-surface p-4 space-y-3">
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal">
              <option value="EMAIL">Email</option>
              <option value="TELEGRAM">Telegram</option>
              <option value="WEBHOOK">Webhook</option>
              <option value="DISCORD">Discord</option>
            </select>
            <input required value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Address / chat ID / URL" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal" />
            <button type="submit" className="w-full rounded-md bg-signal py-2 text-sm font-medium text-bg hover:opacity-90">Add channel</button>
          </form>
        ) : (
          <button onClick={() => setShowForm(true)} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-sm text-text-muted hover:border-signal hover:text-signal">
            <Plus size={14} /> Add channel
          </button>
        )}
      </div>
    </div>
  );
}
