import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1C2E",
          blue: "#1A3558",
          deep: "#1557A0",
          light: "#EEF2F7",
          gray: "#F4F6F8",
          muted: "#D7DEE8",
          silver: "#6B7C90",
          dark: "#243447",
          accent: "#A8C00E",
          "accent-dark": "#8BA30B",
          ink: "#07111C",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "var(--font-noto-sans-kr)",
          "var(--font-plex)",
          "ui-sans-serif",
          "sans-serif",
        ],
        display: [
          "var(--font-source-serif)",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 0 rgba(11, 28, 46, 0.06), 0 8px 24px rgba(11, 28, 46, 0.06)",
        lift: "0 12px 28px rgba(11, 28, 46, 0.10)",
      },
      backgroundImage: {
        "surface-grid":
          "linear-gradient(rgba(11,28,46,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(11,28,46,0.035) 1px, transparent 1px)",
        "navy-wash":
          "linear-gradient(135deg, #0B1C2E 0%, #132A44 55%, #0B1C2E 100%)",
      },
      backgroundSize: {
        "grid-sm": "28px 28px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "slide-down": "slideDown 0.25s ease-out forwards",
        "ken-burns": "kenBurns 28s ease-out infinite alternate",
        "scroll-hint": "scrollHint 2.2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        kenBurns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.06)" },
        },
        scrollHint: {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.85" },
          "50%": { transform: "translateY(6px)", opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
