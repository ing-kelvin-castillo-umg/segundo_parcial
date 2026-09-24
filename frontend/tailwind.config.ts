import type { Config } from "tailwindcss";

/**
 * Paleta institucional del proyecto: teal profundo como color primario, ámbar
 * como acento de énfasis y una escala de grafito cálido para las superficies.
 * Sustituye por completo al esquema azul/índigo original.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primario: teal profundo. Acciones principales, enlaces y estados activos.
        primary: {
          50: "#ecfdf7",
          100: "#d1faec",
          200: "#a7f3da",
          300: "#6ee7c3",
          400: "#34d3a8",
          500: "#12b88d",
          600: "#069473",
          700: "#04765e",
          800: "#065d4c",
          900: "#064c40",
          950: "#022c25",
        },
        // Acento: ámbar dorado. Destaca precios, avisos y elementos secundarios.
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        // Superficies: grafito cálido, con un matiz verdoso que amarra con el primario.
        surface: {
          50: "#f7f8f7",
          100: "#eef1f0",
          200: "#dbe1df",
          300: "#bcc7c4",
          400: "#94a5a1",
          500: "#738884",
          600: "#5b6d6a",
          700: "#4b5a57",
          800: "#3f4b49",
          900: "#28312f",
          950: "#141a19",
        },
        // Semánticos: disponibilidad de inventario y acciones destructivas.
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(18, 184, 141, 0.45)",
        "glow-accent": "0 0 40px -12px rgba(245, 158, 11, 0.45)",
        card: "0 1px 2px 0 rgba(20, 26, 25, 0.04), 0 8px 24px -12px rgba(20, 26, 25, 0.18)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.35s ease-out both",
        "fade-in": "fade-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
