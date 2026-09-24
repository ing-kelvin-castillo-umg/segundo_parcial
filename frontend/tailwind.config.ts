import type { Config } from "tailwindcss";

/** Color respaldado por una variable CSS con canales RGB (permite bg-primary/10, etc.). */
const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** Escala 50–900 (y 950 si se indica) leída de --color-<name>-<step>. */
const scale = (name: string, steps: number[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) =>
  Object.fromEntries(steps.map((step) => [step, token(`${name}-${step}`)]));

const STATE_STEPS = [50, 100, 200, 500, 600, 700, 800];

const config: Config = {
  // Todo src: hay clases definidas fuera de app/components (ej. lib/stock.ts con los badges de stock).
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Marca
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground"), ...scale("primary") },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
          ...scale("secondary", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        },
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground"), ...scale("accent") },

        // Estados
        success: { DEFAULT: token("success"), foreground: token("success-foreground"), ...scale("success", STATE_STEPS) },
        warning: { DEFAULT: token("warning"), foreground: token("warning-foreground"), ...scale("warning", STATE_STEPS) },
        danger: { DEFAULT: token("danger"), foreground: token("danger-foreground"), ...scale("danger", STATE_STEPS) },

        // Neutros semánticos
        background: token("background"),
        surface: token("surface"),
        foreground: token("foreground"),
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px -4px rgb(11 42 60 / 0.10)",
        "card-hover": "0 2px 4px rgb(15 23 42 / 0.06), 0 16px 32px -8px rgb(11 42 60 / 0.22)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        "scale-in": "scale-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-down": "slide-down 200ms ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
