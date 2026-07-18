"use client";

import { useState } from "react";
import { Mail, MessageSquare, Webhook, Bell, User, Shield, Trash2 } from "lucide-react";

const TABS = ["Account", "Notifications", "Security"];

const CHANNELS = [
  { icon: Mail, label: "Email", value: "you@company.com", active: true },
  { icon: MessageSquare, label: "Telegram", value: "Not connected", active: false },
  { icon: Webhook, label: "Webhook", value: "Not connected", active: false },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("Account");

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">Manage your account and notification preferences</p>

      <div className="mt-6 flex items-center gap-1 rounded-md border border-border bg-surface p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t ? "bg-signal/10 text-signal" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Account" && (
        <div className="mt-6 max-w-lg space-y-6">
          <div className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-text-primary">
              <User size={14} />
              <h2 className="font-display text-sm font-medium">Profile</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Name</label>
                <input className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal" defaultValue="Karthik" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Email</label>
                <input className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal" defaultValue="you@company.com" disabled />
              </div>
            </div>
            <button className="mt-4 rounded-md bg-signal px-4 py-2 text-xs font-medium text-bg hover:opacity-90">
              Save changes
            </button>
          </div>

          <div className="rounded-card border border-incident/30 bg-incident/5 p-5">
            <div className="flex items-center gap-2 text-incident">
              <Trash2 size={14} />
              <h2 className="font-display text-sm font-medium">Danger zone</h2>
            </div>
            <p className="mt-1 text-xs text-text-secondary">Deleting your account removes all monitors and data permanently.</p>
            <button className="mt-3 rounded-md border border-incident/40 px-3 py-1.5 text-xs font-medium text-incident hover:bg-incident/10">
              Delete account
            </button>
          </div>
        </div>
      )}

      {tab === "Notifications" && (
        <div className="mt-6 max-w-lg space-y-3">
          {CHANNELS.map((c) => (
            <div key={c.label} className="flex items-center justify-between rounded-card border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-white/5 p-2">
                  <c.icon size={16} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{c.label}</p>
                  <p className="text-xs text-text-muted">{c.value}</p>
                </div>
              </div>
              <button className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                c.active ? "border border-signal/40 text-signal" : "bg-signal text-bg hover:opacity-90"
              }`}>
                {c.active ? "Connected" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "Security" && (
        <div className="mt-6 max-w-lg space-y-6">
          <div className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-text-primary">
              <Shield size={14} />
              <h2 className="font-display text-sm font-medium">Password</h2>
            </div>
            <div className="mt-4 space-y-3">
              <input type="password" placeholder="Current password" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal" />
              <input type="password" placeholder="New password" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal" />
            </div>
            <button className="mt-4 rounded-md bg-signal px-4 py-2 text-xs font-medium text-bg hover:opacity-90">
              Update password
            </button>
          </div>

          <div className="flex items-center justify-between rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-text-primary">
              <Bell size={14} />
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-text-muted">Add an extra layer of security</p>
              </div>
            </div>
            <button className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover">
              Enable
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
