"use client";

import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/dashboard/ProfileCard";

interface ProfileData {
  user: {
    name: string;
    email: string;
    role: string;
    plan: string;
    planExpiresAt: string | null;
    monitorLimit: number;
    createdAt: string;
  };
  stats: { monitorCount: number; incidentCount: number; channelCount: number };
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-sm text-text-muted">Loading...</div>;

  const joinedAt = new Date(data.user.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Profile</h1>
      <p className="mt-1 text-sm text-text-secondary">Your account overview</p>

      <div className="mt-6 max-w-xl">
        <ProfileCard
          name={data.user.name}
          email={data.user.email}
          role={data.user.role}
          plan={data.user.plan}
          joinedAt={joinedAt}
          monitorCount={data.stats.monitorCount}
          monitorLimit={data.user.monitorLimit}
          incidentCount={data.stats.incidentCount}
          channelCount={data.stats.channelCount}
        />
      </div>
    </div>
  );
}
