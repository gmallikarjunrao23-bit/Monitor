"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AddMonitorModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const TYPES = ["HTTPS", "HTTP", "TCP", "PING", "DNS", "API"];

export function AddMonitorModal({ onClose, onCreated }: AddMonitorModalProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("HTTPS");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, target, type }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create monitor");
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-text-primary">Add Monitor</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-incident/30 bg-incident/10 px-3 py-2 text-sm text-incident">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="api.myapp.com"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Target URL / IP</label>
            <input
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="https://api.myapp.com/health"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-signal py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create monitor"}
          </button>
        </form>
      </div>
    </div>
  );
}
