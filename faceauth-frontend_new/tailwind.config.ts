import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12211E",
        "ink-soft": "#1B2E29",
        paper: "#EAE4D3",
        "paper-dim": "#DCD5C0",
        graphite: "#3A3F3D",
        gold: "#B9862F",
        "gold-soft": "#D9AE64",
        signal: "#7C9A82",
        rust: "#A6432B",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
