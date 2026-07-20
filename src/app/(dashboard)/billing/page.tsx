"use client";

import { useEffect, useState } from "react";
import { Check, Upload, Copy, ArrowLeft, ArrowRight, CheckCircle2, Zap, Building2, Sparkles } from "lucide-react";

const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: 0,
    icon: Sparkles,
    tagline: "For trying things out",
    features: ["5 Monitors", "5 min checks", "Email alerts", "7 day history"],
  },
  {
    key: "PRO",
    name: "Pro",
    price: 499,
    icon: Zap,
    tagline: "For growing teams",
    features: ["50 Monitors", "1 min checks", "Telegram + Email + Discord", "AI Incident Commander", "90 day history", "Public status pages"],
    highlight: true,
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: 1999,
    icon: Building2,
    tagline: "For serious infrastructure",
    features: ["1000 Monitors", "30 sec checks", "All notification channels", "Team collaboration", "1 year history", "Priority support"],
  },
];

const UPI_ID = "toxic-karthik.sai@fam";

type Step = "plans" | "pay" | "upload" | "done";

export default function BillingPage() {
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setCurrentPlan(d.user?.plan ?? "FREE"));
  }, []);

  function selectPlan(key: string) {
    if (key === "FREE" || key === currentPlan) return;
    setSelectedPlan(key);
    setStep("pay");
  }

  function copyUpi() {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setScreenshot(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!selectedPlan || !screenshot) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("plan", selectedPlan);
    formData.append("screenshot", screenshot);

    const res = await fetch("/api/billing/upload", { method: "POST", body: formData });
    setUploading(false);

    if (res.ok) {
      setStep("done");
    }
  }

  const plan = PLANS.find((p) => p.key === selectedPlan);
  const STEPS: Step[] = ["plans", "pay", "upload", "done"];
  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Billing</h1>
      <p className="mt-1 text-sm text-text-secondary">Manage your subscription and payment</p>

      {/* Step indicator */}
      {step !== "plans" && (
        <div className="mt-6 flex items-center gap-2">
          {["Choose plan", "Pay via UPI", "Upload proof", "Done"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                i < stepIndex ? "bg-signal text-bg" : i === stepIndex ? "border border-signal text-signal" : "border border-border text-text-muted"
              }`}>
                {i < stepIndex ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-xs ${i <= stepIndex ? "text-text-primary" : "text-text-muted"}`}>{label}</span>
              {i < 3 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>
      )}

      {/* Step: Plans */}
      {step === "plans" && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          {PLANS.map((p) => {
            const Icon = p.icon;
            const isCurrent = p.key === currentPlan;
            return (
              <button
                key={p.key}
                onClick={() => selectPlan(p.key)}
                disabled={p.key === "FREE" || isCurrent}
                className={`group relative rounded-card border p-6 text-left transition-all ${
                  p.highlight ? "border-signal/40 bg-signal/5" : "border-border bg-surface"
                } ${isCurrent ? "opacity-60" : "hover:-translate-y-1 hover:border-signal/40 hover:shadow-card-hover"} ${
                  p.key === "FREE" ? "cursor-default" : "cursor-pointer"
                }`}
              >
                {p.highlight && !isCurrent && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-signal px-2 py-0.5 text-[10px] font-medium text-bg">
                    MOST POPULAR
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-text-muted px-2 py-0.5 text-[10px] font-medium text-bg">
                    CURRENT PLAN
                  </span>
                )}

                <div className={`inline-flex rounded-md p-2 ${p.highlight ? "bg-signal/10" : "bg-white/5"}`}>
                  <Icon size={18} className={p.highlight ? "text-signal" : "text-text-secondary"} />
                </div>

                <h3 className="mt-3 font-display text-base font-medium text-text-primary">{p.name}</h3>
                <p className="text-xs text-text-muted">{p.tagline}</p>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-medium text-text-primary mono-tabular">₹{p.price}</span>
                  {p.price > 0 && <span className="text-sm text-text-muted">/month</span>}
                </div>

                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check size={14} className="shrink-0 text-signal" />
                      {f}
                    </li>
                  ))}
                </ul>

                {p.key !== "FREE" && !isCurrent && (
                  <div className="mt-5 flex items-center justify-center gap-1 rounded-md bg-signal py-2 text-sm font-medium text-bg opacity-0 transition-opacity group-hover:opacity-100">
                    Select plan <ArrowRight size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Step: Pay */}
      {step === "pay" && plan && (
        <div className="mt-8 max-w-md animate-fade-up">
          <button onClick={() => setStep("plans")} className="mb-4 flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft size={14} /> Back to plans
          </button>

          <div className="rounded-card border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Upgrading to</p>
                <h3 className="font-display text-lg font-medium text-text-primary">{plan.name}</h3>
              </div>
              <span className="font-mono text-2xl font-medium text-signal">₹{plan.price}</span>
            </div>

            <div className="mt-6 rounded-md border border-border-subtle bg-bg p-5 text-center">
              <p className="text-xs text-text-muted">Pay via any UPI app to</p>
              <p className="mt-2 font-mono text-lg text-signal">{UPI_ID}</p>
              <button
                onClick={copyUpi}
                className="mt-3 flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-signal hover:text-signal mx-auto"
              >
                {copied ? <Check size={12} className="text-signal" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy UPI ID"}
              </button>
            </div>

            <p className="mt-4 text-xs text-text-muted">
              After paying, take a screenshot of the payment confirmation and upload it in the next step.
            </p>

            <button
              onClick={() => setStep("upload")}
              className="mt-5 flex w-full items-center justify-center gap-1 rounded-md bg-signal py-2.5 text-sm font-medium text-bg hover:opacity-90"
            >
              I've paid — Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Upload */}
      {step === "upload" && plan && (
        <div className="mt-8 max-w-md animate-fade-up">
          <button onClick={() => setStep("pay")} className="mb-4 flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft size={14} /> Back
          </button>

          <div className="rounded-card border border-border bg-surface p-6">
            <h3 className="font-display text-base font-medium text-text-primary">Upload payment proof</h3>
            <p className="mt-1 text-xs text-text-secondary">A screenshot of the UPI confirmation is enough.</p>

            <label className="mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-center transition-colors hover:border-signal">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="max-h-40 rounded-md" />
              ) : (
                <>
                  <Upload size={20} className="text-text-muted" />
                  <span className="text-sm text-text-secondary">Tap to choose a screenshot</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {screenshot && <p className="mt-2 truncate text-center text-xs text-text-muted">{screenshot.name}</p>}

            <button
              onClick={handleSubmit}
              disabled={!screenshot || uploading}
              className="mt-5 w-full rounded-md bg-signal py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? "Submitting..." : "Submit for approval"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="mt-8 max-w-md animate-fade-up">
          <div className="rounded-card border border-signal/30 bg-signal/5 p-8 text-center">
            <CheckCircle2 size={32} className="mx-auto text-signal" />
            <h3 className="mt-3 font-display text-base font-medium text-text-primary">Payment submitted</h3>
            <p className="mt-1 text-sm text-text-secondary">
              An admin will review your screenshot shortly. Your plan updates automatically once approved — usually within a few hours.
            </p>
            <button
              onClick={() => { setStep("plans"); setSelectedPlan(null); setScreenshot(null); setPreview(null); }}
              className="mt-5 rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
            >
              Back to plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
