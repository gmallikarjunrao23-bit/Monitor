"use client";

import { useState } from "react";
import { X, Wrench } from "lucide-react";

interface MaintenanceModalProps {
  monitorId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function MaintenanceModal({ monitorId, onClose, onCreated }: MaintenanceModalProps) {
  const [title, setTitle] = useState("Scheduled maintenance");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/monitors/${monitorId}/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startTime, endTime }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to schedule maintenance");
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-medium text-text-primary">
            <Wrench size={16} className="text-degraded" /> Schedule Maintenance
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-xs text-text-secondary">
          Checks that fail during this window won't trigger incidents or alerts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-incident/30 bg-incident/10 px-3 py-2 text-sm text-incident">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Start</label>
            <input
              required
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">End</label>
            <input
              required
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-degraded py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Scheduling..." : "Schedule maintenance"}
          </button>
        </form>
      </div>
    </div>
  );
}
