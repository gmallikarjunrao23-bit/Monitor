"use client";

import { useState } from "react";
import { Check, Upload } from "lucide-react";

const PLANS = [
  { key: "FREE", name: "Free", price: 0, features: ["5 Monitors", "5 min checks", "Email alerts", "7 day history"] },
  { key: "PRO", name: "Pro", price: 499, features: ["50 Monitors", "1 min checks", "Telegram + Email + Discord", "AI Incident Commander", "90 day history"], highlight: true },
  { key: "ENTERPRISE", name: "Enterprise", price: 1999, features: ["1000 Monitors", "30 sec checks", "All channels", "Team collaboration", "1 year history"] },
];

const UPI_ID = "toxic-karthik.sai@fam";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");

  async function handleUpload() {
    if (!selectedPlan || !screenshot) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("plan", selectedPlan);
    formData.append("screenshot", screenshot);

    const res = await fetch("/api/billing/upload", { method: "POST", body: formData });
    setStatus(res.ok ? "done" : "idle");
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Billing</h1>
      <p className="mt-1 text-sm text-text-secondary">Choose a plan and pay via UPI — approvals are reviewed manually.</p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <button
            key={plan.key}
            onClick={() => plan.price > 0 && setSelectedPlan(plan.key)}
            className={`rounded-card border p-6 text-left transition-all ${
              selectedPlan === plan.key ? "border-signal bg-signal/5" : "border-border bg-surface hover:border-border-subtle hover:bg-surface-hover"
            } ${plan.highlight ? "relative" : ""}`}
          >
            {plan.highlight && (
              <span className="absolute -top-2.5 left-6 rounded-full bg-signal px-2 py-0.5 text-[10px] font-medium text-bg">
                MOST POPULAR
              </span>
            )}
            <h3 className="font-display text-base font-medium text-text-primary">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-medium text-text-primary mono-tabular">₹{plan.price}</span>
              {plan.price > 0 && <span className="text-sm text-text-muted">/month</span>}
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check size={14} className="shrink-0 text-signal" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {selectedPlan && status !== "done" && (
        <div className="mt-8 max-w-md rounded-card border border-border bg-surface p-6">
          <h3 className="font-display text-base font-medium text-text-primary">
            Pay for {PLANS.find((p) => p.key === selectedPlan)?.name}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Send ₹{PLANS.find((p) => p.key === selectedPlan)?.price} via UPI, then upload your payment screenshot.
          </p>

          <div className="mt-4 rounded-md border border-border-subtle bg-bg p-4 text-center">
            <p className="font-mono text-sm text-signal">{UPI_ID}</p>
          </div>

          <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border py-6 text-center transition-colors hover:border-signal">
            <Upload size={20} className="text-text-muted" />
            <span className="text-sm text-text-secondary">
              {screenshot ? screenshot.name : "Upload payment screenshot"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)} />
          </label>

          <button
            onClick={handleUpload}
            disabled={!screenshot || status === "uploading"}
            className="mt-4 w-full rounded-md bg-signal py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
          >
            {status === "uploading" ? "Uploading..." : "Submit for approval"}
          </button>
        </div>
      )}

      {status === "done" && (
        <div className="mt-8 max-w-md rounded-card border border-degraded/30 bg-degraded/5 p-6 text-center">
          <p className="font-medium text-degraded">Payment submitted</p>
          <p className="mt-1 text-sm text-text-secondary">Under review — your plan updates automatically once approved.</p>
        </div>
      )}
    </div>
  );
      }
