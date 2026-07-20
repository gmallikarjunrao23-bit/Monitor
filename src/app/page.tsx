import Link from "next/link";
import { Activity, Bell, Shield, Zap, ArrowRight, Gauge } from "lucide-react";
import { PulseLine } from "@/components/dashboard/PulseLine";

const FEATURES = [
  { icon: Activity, title: "Real-time Monitoring", desc: "HTTP, TCP, PING, DNS, and API checks as fast as every 30 seconds." },
  { icon: Bell, title: "Instant Alerts", desc: "Email, Telegram, Discord, and webhooks — know the moment something breaks." },
  { icon: Shield, title: "SSL Tracking", desc: "Never get caught off guard by an expired certificate again." },
  { icon: Gauge, title: "AI Incident Commander", desc: "Automatic root-cause analysis the moment an incident opens." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="glass sticky top-0 z-40 flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7">
            <div className="absolute inset-0 rounded-md bg-signal/20" />
            <div className="absolute inset-[3px] rounded-[4px] bg-signal animate-glow-pulse" />
          </div>
          <span className="font-display text-[15px] font-semibold text-text-primary">InfraOps</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-sm text-text-secondary hover:text-text-primary">Docs</Link>
          <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary">Sign in</Link>
          <Link href="/register" className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-bg hover:opacity-90">
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-24 text-center">
        <div className="mx-auto mb-8 h-16 w-full max-w-md opacity-80">
          <PulseLine status="up" className="h-full w-full" />
        </div>
        <h1 className="font-display text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Infrastructure monitoring,<br />intelligently watched.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-text-secondary">
          Uptime monitoring with AI-powered incident analysis. Know the moment something breaks — before your customers do.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/register" className="flex items-center gap-1.5 rounded-md bg-signal px-5 py-2.5 text-sm font-medium text-bg hover:opacity-90">
            Start monitoring free <ArrowRight size={14} />
          </Link>
          <Link href="/login" className="rounded-md border border-border px-5 py-2.5 text-sm text-text-secondary hover:bg-surface-hover">
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-card border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-signal/30 hover:shadow-card-hover">
              <div className="inline-flex rounded-md bg-signal/10 p-2">
                <f.icon size={18} className="text-signal" />
              </div>
              <h3 className="mt-3 font-display text-sm font-medium text-text-primary">{f.title}</h3>
              <p className="mt-1 text-xs text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border-subtle px-6 py-8 text-center text-xs text-text-muted">
        © 2026 InfraOps. Built for teams who can't afford downtime.
      </footer>
    </div>
  );
}
