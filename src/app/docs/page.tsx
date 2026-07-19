"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Rocket, Activity, Bell, CreditCard, Shield, Code2, HelpCircle, ArrowLeft, Copy, Check,
} from "lucide-react";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Rocket },
  { id: "monitors", label: "Monitors", icon: Activity },
  { id: "alerts", label: "Alerts & Channels", icon: Bell },
  { id: "billing", label: "Billing & Plans", icon: CreditCard },
  { id: "admin", label: "Admin & Security", icon: Shield },
  { id: "api", label: "API Reference", icon: Code2 },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative mt-3 rounded-md border border-border bg-bg">
      <button
        onClick={() => {
          navigator.clipboard.writeText(children);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-2 top-2 rounded-md border border-border bg-surface p-1.5 text-text-muted hover:text-signal"
      >
        {copied ? <Check size={12} className="text-signal" /> : <Copy size={12} />}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-xs text-text-secondary">{children}</pre>
    </div>
  );
}

export default function DocsPage() {
  const [active, setActive] = useState("getting-started");

  return (
    <div className="min-h-screen bg-bg">
      <header className="glass sticky top-0 z-40 flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-7 w-7">
            <div className="absolute inset-0 rounded-md bg-signal/20" />
            <div className="absolute inset-[3px] rounded-[4px] bg-signal animate-glow-pulse" />
          </div>
          <span className="font-display text-[15px] font-semibold text-text-primary">InfraOps Docs</span>
        </Link>
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-text-secondary hover:text-signal">
          <ArrowLeft size={14} /> Back to app
        </Link>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
        {/* Sidebar */}
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 md:block">
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setActive(id)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  active === id ? "bg-signal/10 text-signal" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                <Icon size={15} /> {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 space-y-16">
          <div>
            <h1 className="font-display text-3xl font-semibold text-text-primary">Documentation</h1>
            <p className="mt-2 text-text-secondary">Everything you need to monitor your infrastructure with InfraOps.</p>
          </div>

          <section id="getting-started" className="scroll-mt-24">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-medium text-text-primary">
              <Rocket size={18} className="text-signal" /> Getting Started
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Create an account, add your first monitor, and InfraOps starts watching your infrastructure immediately.
            </p>
            <ol className="mt-4 space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal/10 text-xs font-medium text-signal">1</span>
                Sign up with email or Google/GitHub.
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal/10 text-xs font-medium text-signal">2</span>
                Go to <strong className="text-text-primary">Monitors → Add Monitor</strong> and enter a name, target URL, and type.
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal/10 text-xs font-medium text-signal">3</span>
                Add a notification channel in <strong className="text-text-primary">Settings</strong> so you get alerted the moment something breaks.
              </li>
            </ol>
          </section>

          <section id="monitors" className="scroll-mt-24">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-medium text-text-primary">
              <Activity size={18} className="text-signal" /> Monitors
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              InfraOps supports six monitor types, each suited to a different layer of your stack.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { type: "HTTPS/HTTP", desc: "Checks status code, response time, and optional keyword matching." },
                { type: "TCP", desc: "Opens a raw socket connection to a host:port — good for databases, queues." },
                { type: "PING", desc: "ICMP ping to confirm a host is reachable at the network layer." },
                { type: "DNS", desc: "Confirms a hostname resolves correctly." },
                { type: "API", desc: "Like HTTP, with support for custom headers and request bodies." },
                { type: "SSL", desc: "Tracks certificate expiry and flags certs expiring soon." },
              ].map((m) => (
                <div key={m.type} className="rounded-card border border-border bg-surface p-4">
                  <p className="font-mono text-xs font-medium text-signal">{m.type}</p>
                  <p className="mt-1 text-xs text-text-secondary">{m.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              A monitor is marked <strong className="text-incident">DOWN</strong> after 2 consecutive failed checks, to avoid false alarms from a single dropped request.
            </p>
          </section>

          <section id="alerts" className="scroll-mt-24">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-medium text-text-primary">
              <Bell size={18} className="text-signal" /> Alerts & Channels
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Add channels in Settings to get notified the moment a monitor changes state — down, degraded, or recovered.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>• <strong className="text-text-primary">Email</strong> — sent to any address you verify.</li>
              <li>• <strong className="text-text-primary">Telegram</strong> — instant push to a chat or bot.</li>
              <li>• <strong className="text-text-primary">Webhook</strong> — POST a JSON payload to your own endpoint.</li>
              <li>• <strong className="text-text-primary">Discord</strong> — post directly into a channel.</li>
            </ul>
          </section>

          <section id="billing" className="scroll-mt-24">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-medium text-text-primary">
              <CreditCard size={18} className="text-signal" /> Billing & Plans
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { plan: "Free", price: "₹0", interval: "5 min checks", monitors: "5 monitors" },
                { plan: "Pro", price: "₹499", interval: "1 min checks", monitors: "50 monitors" },
                { plan: "Enterprise", price: "₹1999", interval: "30 sec checks", monitors: "1000 monitors" },
              ].map((p) => (
                <div key={p.plan} className="rounded-card border border-border bg-surface p-4">
                  <p className="font-display text-sm font-medium text-text-primary">{p.plan}</p>
                  <p className="mt-1 font-mono text-lg text-signal">{p.price}<span className="text-xs text-text-muted">/mo</span></p>
                  <p className="mt-2 text-xs text-text-secondary">{p.interval}</p>
                  <p className="text-xs text-text-secondary">{p.monitors}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              Payments are made via UPI and reviewed manually — your plan updates automatically once an admin approves your payment screenshot, usually within a few hours.
            </p>
          </section>

          <section id="admin" className="scroll-mt-24">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-medium text-text-primary">
              <Shield size={18} className="text-signal" /> Admin & Security
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Admin accounts can review and approve pending payments from the Admin panel. All actions are logged for audit purposes. Passwords are hashed with bcrypt, and sessions are signed with a rotating secret — never share your session or API credentials.
            </p>
          </section>

          <section id="api" className="scroll-mt-24">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-medium text-text-primary">
              <Code2 size={18} className="text-signal" /> API Reference
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">List your monitors:</p>
            <CodeBlock>{`GET /api/monitors
Authorization: session cookie (browser) 

Response:
{
  "monitors": [
    { "id": "...", "name": "api.myapp.com", "status": "UP", "uptimePercent": 99.98 }
  ]
}`}</CodeBlock>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">Create a monitor:</p>
            <CodeBlock>{`POST /api/monitors
Content-Type: application/json

{
  "name": "api.myapp.com",
  "target": "https://api.myapp.com/health",
  "type": "HTTPS",
  "checkIntervalSec": 60
}`}</CodeBlock>
          </section>

          <section id="faq" className="scroll-mt-24">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-medium text-text-primary">
              <HelpCircle size={18} className="text-signal" /> FAQ
            </h2>
            <div className="space-y-4">
              {[
                { q: "Does InfraOps keep my site online?", a: "No — InfraOps watches your infrastructure and alerts you the moment something breaks. Keeping the site up is your hosting provider's job; InfraOps is the watchdog, not the server." },
                { q: "How fast are checks?", a: "Depends on your plan — Free is every 5 minutes, Pro every 1 minute, Enterprise every 30 seconds." },
                { q: "Can I change my check interval?", a: "Yes, when adding a monitor you can pick any interval your plan allows." },
                { q: "What counts as 'down'?", a: "2 consecutive failed checks in a row — this avoids false alarms from a single network blip." },
              ].map((f) => (
                <div key={f.q} className="rounded-card border border-border bg-surface p-4">
                  <p className="text-sm font-medium text-text-primary">{f.q}</p>
                  <p className="mt-1 text-sm text-text-secondary">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
                }
