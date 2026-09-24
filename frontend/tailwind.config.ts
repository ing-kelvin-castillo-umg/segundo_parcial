import type { Config } from "tailwindcss";

/**
 * Paleta Fase 4 — "Marino, eléctrico y turquesa":
 *  - navy      → azul marino profundo (fondos, sidebar, navbar)
 *  - electric  → azul eléctrico (acciones primarias, enlaces)
 *  - turquoise → turquesa (acentos, estados positivos, resaltados)
 *  - mist      → neutros claros azulados (fondos y bordes del panel)
 *
 * Los tonos `slate`, `blue`, `indigo` y `emerald` de Tailwind se redefinen con esta misma paleta,
 * de modo que toda la interfaz cambia de forma coherente sin duplicar estilos.
 */
const navy = {
  50: "#F5F8FC",
  100: "#EAF0F8",
  200: "#D9E3F0",
  300: "#B9C8DC",
  400: "#8497B3",
  500: "#5D7191",
  600: "#455877",
  700: "#2F4160",
  800: "#1B2B4B",
  900: "#0F1D3A",
  950: "#081227",
};

const electric = {
  50: "#EEF4FF",
  100: "#DCE8FF",
  200: "#BCD3FF",
  300: "#8DB4FF",
  400: "#5B90FF",
  500: "#2E6BFF",
  600: "#1B55F0",
  700: "#1443C4",
  800: "#15389C",
  900: "#162F78",
  950: "#0E1E4D",
};

const cobalt = {
  50: "#EEF1FF",
  100: "#DFE5FF",
  200: "#C3CDFF",
  300: "#9DAEFF",
  400: "#7188FF",
  500: "#4F68F2",
  600: "#3A50D6",
  700: "#2E40AD",
  800: "#2A3889",
  900: "#283370",
  950: "#181F45",
};

const turquoise = {
  50: "#ECFEFB",
  100: "#CFFAF3",
  200: "#A0F3E7",
  300: "#64E6D8",
  400: "#2DD4C4",
  500: "#14B8AA",
  600: "#0E958D",
  700: "#0F766F",
  800: "#115E59",
  900: "#134E4A",
  950: "#042F2E",
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nombres semánticos de la nueva paleta
        navy,
        electric,
        turquoise,
        mist: navy,
        brand: electric,
        // Redefinición de las escalas usadas en los componentes existentes
        slate: navy,
        blue: electric,
        indigo: cobalt,
        emerald: turquoise,
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', "system-ui", "-apple-system", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 29, 58, 0.06), 0 8px 24px -8px rgba(15, 29, 58, 0.12)",
        glow: "0 10px 40px -10px rgba(46, 107, 255, 0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        progress: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        progress: "progress 4.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
