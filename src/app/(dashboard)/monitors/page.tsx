"use client";

import { useEffect, useState, useCallback } from "react";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { AddMonitorModal } from "@/components/monitors/AddMonitorModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Plus, Search, Activity } from "lucide-react";

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
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={monitors.length === 0 ? "No monitors yet" : `No monitors match "${query}"`}
          description={monitors.length === 0 ? "Add your first monitor to start watching your infrastructure." : undefined}
          action={monitors.length === 0 ? { label: "Add your first monitor", onClick: () => setShowModal(true) } : undefined}
        />
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
