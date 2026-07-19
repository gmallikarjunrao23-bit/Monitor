import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0E14",
        surface: "#12161F",
        "surface-hover": "#171C27",
        "surface-glass": "#161B26cc",
        border: "#1E2430",
        "border-subtle": "#171B24",
        "text-primary": "#E8EAED",
        "text-secondary": "#8B92A3",
        "text-muted": "#5A6172",
        signal: { DEFAULT: "#3DD9C4", dim: "#1F6B62", glow: "#3DD9C433" },
        incident: { DEFAULT: "#FF6B4A", dim: "#8A3A28", glow: "#FF6B4A33" },
        degraded: { DEFAULT: "#F5B841", dim: "#8A6A24", glow: "#F5B84133" },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "pulse-line": { "0%": { strokeDashoffset: "1000" }, "100%": { strokeDashoffset: "0" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "glow-pulse": { "0%, 100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-468px 0" }, "100%": { backgroundPosition: "468px 0" } },
      },
      animation: {
        "pulse-line": "pulse-line 3.5s linear infinite",
        "fade-up": "fade-up 0.4s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s linear infinite",
      },
      borderRadius: { card: "12px" },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset",
        "card-hover": "0 8px 24px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(61,217,196,0.08) inset",
      },
    },
  },
  plugins: [],
};

export default config;
