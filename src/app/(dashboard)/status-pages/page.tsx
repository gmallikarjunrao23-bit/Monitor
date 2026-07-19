"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Globe } from "lucide-react";

interface StatusPage {
  id: string;
  title: string;
  slug: string;
  isPublic: boolean;
}

export default function StatusPagesPage() {
  const [pages, setPages] = useState<StatusPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  const fetchPages = useCallback(async () => {
    const res = await fetch("/api/status-pages");
    if (res.ok) {
      const data = await res.json();
      setPages(data.pages ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/status-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, monitorIds: [] }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create");
      return;
    }
    setTitle("");
    setSlug("");
    setShowForm(false);
    fetchPages();
  }

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
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. myapp Status)" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal" />
          <input required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder="url-slug" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal" />
          <button type="submit" className="w-full rounded-md bg-signal py-2 text-sm font-medium text-bg hover:opacity-90">Create</button>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
