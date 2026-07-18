"use client";

interface PulseLineProps {
  status?: "up" | "down" | "degraded";
  className?: string;
  animated?: boolean;
}

const STATUS_COLOR = { up: "#3DD9C4", down: "#FF6B4A", degraded: "#F5B841" };

export function PulseLine({ status = "up", className = "", animated = true }: PulseLineProps) {
  const color = STATUS_COLOR[status];
  return (
    <svg viewBox="0 0 400 60" className={className} fill="none" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0,30 L120,30 L135,10 L150,50 L165,30 L400,30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={animated ? "1000" : undefined}
        className={animated ? "animate-pulse-line" : ""}
        style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
      />
    </svg>
  );
}
