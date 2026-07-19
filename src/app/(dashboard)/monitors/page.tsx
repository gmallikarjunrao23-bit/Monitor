"use client";

import { useEffect, useState, useCallback } from "react";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { AddMonitorModal } from "@/components/monitors/AddMonitorModal";
import { Plus, Search } from "lucide-react";

interface Monitor {
  id: string;
  name: string;
  target: string;
  status: "UP" | "DOWN" | "DEGRADED" | "PENDING" | "MAINTENANCE";
  uptimePercent: number;
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");

  const fetchMonitors = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/monitors");
    if (res.ok) {
      const data = await res.json();
      setMonitors(data.monitors ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  const filtered = monitors.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Monitors</h1>
          <p className="mt-1 text-sm text-text-secondary">{monitors.length} monitors being watched</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
        >
          <Plus size={16} /> Add Monitor
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 w-64">
        <Search size={14} className="text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search monitors..."
          className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-20 text-center">
          <p className="text-sm text-text-secondary">
            {monitors.length === 0 ? "No monitors yet" : `No monitors match "${query}"`}
          </p>
          {monitors.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 rounded-md bg-signal px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
            >
              Add your first monitor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MonitorCard key={m.id} {...m} />
          ))}
        </div>
      )}

      {showModal && (
        <AddMonitorModal onClose={() => setShowModal(false)} onCreated={fetchMonitors} />
      )}
    </div>
  );
}
