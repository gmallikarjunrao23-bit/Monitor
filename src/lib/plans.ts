export const PLANS = {
  FREE: {
    name: "Free",
    priceInr: 0,
    monitorLimit: 5,
    checkIntervalSec: 300,
    features: ["5 Monitors", "5 min checks", "Email alerts", "7 day history"],
  },
  PRO: {
    name: "Pro",
    priceInr: 499,
    monitorLimit: 50,
    checkIntervalSec: 60,
    features: [
      "50 Monitors",
      "1 min checks",
      "Telegram + Email + Discord alerts",
      "90 day history",
      "AI Incident Commander",
      "Public status pages",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceInr: 1999,
    monitorLimit: 1000,
    checkIntervalSec: 30,
    features: [
      "1000 Monitors",
      "30 sec checks",
      "All notification channels",
      "1 year history",
      "AI Incident Commander",
      "Team collaboration",
      "Priority support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const UPI_ID = "toxic-karthik.sai@fam";
