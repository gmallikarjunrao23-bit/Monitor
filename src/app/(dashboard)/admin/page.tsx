"use client";

import { useEffect, useState } from "react";
import { Check, X, Eye } from "lucide-react";

interface Payment {
  id: string;
  plan: string;
  amountInr: number;
  screenshotUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: { name: string; email: string };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data) => setPayments(data.payments ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function review(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: action === "approve" ? "APPROVED" : "REJECTED" } : p))
      );
    }
  }

  const pending = payments.filter((p) => p.status === "PENDING");
  const reviewed = payments.filter((p) => p.status !== "PENDING");

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Payment approvals</h1>
      <p className="mt-1 text-sm text-text-secondary">Review UPI screenshots and approve or reject upgrades.</p>

      {loading ? (
        <p className="mt-8 text-sm text-text-muted">Loading...</p>
      ) : (
        <>
          <h2 className="mb-3 mt-8 font-display text-sm font-medium uppercase tracking-wide text-text-secondary">
            Pending ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.length === 0 && <p className="text-sm text-text-muted">Nothing waiting on review.</p>}
            {pending.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-card border border-degraded/30 bg-degraded/5 p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPreview(p.screenshotUrl)}
                    className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:text-signal"
                  >
                    View screenshot <Eye size={12} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{p.user.name} · {p.user.email}</p>
                    <p className="font-mono text-xs text-text-muted">{p.plan} · ₹{p.amountInr}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => review(p.id, "approve")} className="flex items-center gap-1 rounded-md bg-signal px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90">
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => review(p.id, "reject")} className="flex items-center gap-1 rounded-md border border-incident/40 px-3 py-1.5 text-xs font-medium text-incident hover:bg-incident/10">
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-8 font-display text-sm font-medium uppercase tracking-wide text-text-secondary">Reviewed</h2>
          <div className="space-y-2">
            {reviewed.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-card border border-border-subtle bg-surface/50 p-3 text-sm">
                <span className="text-text-secondary">{p.user.email} · {p.plan}</span>
                <span className={p.status === "APPROVED" ? "text-signal" : "text-incident"}>{p.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-h-[85vh] max-w-2xl overflow-auto rounded-card border border-border bg-surface p-2">
            <button
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            >
              <X size={16} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Payment screenshot" className="max-h-[80vh] w-auto rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
                }
