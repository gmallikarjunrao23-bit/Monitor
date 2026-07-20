"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Globe, ExternalLink, Check } from "lucide-react";

interface StatusPage {
  id: string;
  title: string;
  slug: string;
  isPublic: boolean;
  monitorIds: string[];
}

interface Monitor {
  id: string;
  name: string;
  target: string;
}

export default function StatusPagesPage() {
  const [pages, setPages] = useState<StatusPage[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>([]);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    const [pagesRes, monitorsRes] = await Promise.all([
      fetch("/api/status-pages"),
      fetch("/api/monitors"),
    ]);
    if (pagesRes.ok) {
      const data = await pagesRes.json();
      setPages(data.pages ?? []);
    }
    if (monitorsRes.ok) {
      const data = await monitorsRes.json();
      setMonitors(data.monitors ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function toggleMonitor(id: string) {
    setSelectedMonitors((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/status-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, monitorIds: selectedMonitors }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create");
      return;
    }
    setTitle("");
    setSlug("");
    setSelectedMonitors([]);
    setShowForm(false);
    fetchAll();
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Status Pages</h1>
          <p className="mt-1 text-sm text-text-secondary">Public pages you can share with customers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-bg hover:opacity-90">
          <Plus size={16} /> Create Status Page
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 max-w-md rounded-card border border-border bg-surface p-5 space-y-3">
          {error && <div className="rounded-md border border-incident/30 bg-incident/10 px-3 py-2 text-sm text-incident">{error}</div>}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="myapp Status"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">URL slug</label>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="myapp"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal"
            />
            {slug && <p className="mt-1 truncate font-mono text-xs text-text-muted">{origin}/status/{slug}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Monitors to show</label>
            {monitors.length === 0 ? (
              <p className="text-xs text-text-muted">No monitors yet — add one first from the Monitors page.</p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-bg p-2">
                {monitors.map((m) => {
                  const selected = selectedMonitors.includes(m.id);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => toggleMonitor(m.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                        selected ? "bg-signal/10 text-signal" : "text-text-secondary hover:bg-surface-hover"
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      {selected && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" className="w-full rounded-md bg-signal py-2 text-sm font-medium text-bg hover:opacity-90">
            Create
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-20 text-center">
          <Globe size={32} className="mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">No status pages yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {pages.map((p) => (
            <div key={p.id} className="rounded-card border border-border bg-surface p-5">
              <h3 className="font-display text-base font-medium text-text-primary">{p.title}</h3>
              <p className="mt-1 font-mono text-xs text-text-muted">/status/{p.slug}</p>
              <p className="mt-2 text-xs text-text-secondary">{p.monitorIds.length} monitor(s) shown</p>
              <a
                href={`/status/${p.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex w-fit items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:text-signal"
              >
                View page <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
