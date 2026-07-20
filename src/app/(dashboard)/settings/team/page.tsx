"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Users, UserPlus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  members: { role: string; user: { name: string; email: string } }[];
}

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchTeams = useCallback(async () => {
    const res = await fetch("/api/teams");
    if (res.ok) {
      const data = await res.json();
      setTeams(data.teams ?? []);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName }),
    });
    setTeamName("");
    setShowCreate(false);
    fetchTeams();
  }

  async function handleInvite(teamId: string) {
    setError("");
    const res = await fetch(`/api/teams/${teamId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: "OPERATOR" }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to invite");
      return;
    }
    setInviteEmail("");
    setInviteTeamId(null);
    fetchTeams();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Team</h1>
          <p className="mt-1 text-sm text-text-secondary">Collaborate with teammates on your monitors</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-bg hover:opacity-90">
          <Plus size={16} /> New Team
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateTeam} className="mb-6 max-w-sm rounded-card border border-border bg-surface p-4 space-y-3">
          <input
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-signal"
          />
          <button type="submit" className="w-full rounded-md bg-signal py-2 text-sm font-medium text-bg hover:opacity-90">Create</button>
        </form>
      )}

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-16 text-center">
          <Users size={28} className="mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">No teams yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((t) => (
            <div key={t.id} className="rounded-card border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-medium text-text-primary">{t.name}</h3>
                <button
                  onClick={() => setInviteTeamId(inviteTeamId === t.id ? null : t.id)}
                  className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover"
                >
                  <UserPlus size={12} /> Invite
                </button>
              </div>

              {inviteTeamId === t.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@email.com"
                    className="flex-1 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text-primary outline-none focus:border-signal"
                  />
                  <button onClick={() => handleInvite(t.id)} className="rounded-md bg-signal px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90">
                    Send
                  </button>
                </div>
              )}
              {error && inviteTeamId === t.id && <p className="mt-2 text-xs text-incident">{error}</p>}

              <div className="mt-4 space-y-2">
                {t.members.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{m.user.name} · {m.user.email}</span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-muted">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
