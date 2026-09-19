import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0E14",
        surface: "#111826",
        surfaceElevated: "#182234",
        border: "#1E2A3A",
        borderMuted: "#15202E",
        talonGold: "#F5B301",
        talonCyan: "#38BDF8",
        talonGreen: "#30A46C",
        talonRed: "#E5484D",
        textPrimary: "#E6EDF3",
        textMuted: "#8B98A9",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;