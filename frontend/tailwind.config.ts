import type { Config } from "tailwindcss";

// Paleta centralizada: cada tono se define como variable CSS (canales RGB) en src/app/globals.css.
// Así las clases admiten opacidad (p. ej. bg-brand-600/20) y la paleta completa se cambia en un solo lugar.
const scale = (name: string) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [
      step,
      `rgb(var(--color-${name}-${step}) / <alpha-value>)`,
    ])
  );

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: scale("brand"), // Azul petróleo: color principal (acciones, enlaces, navegación activa)
        accent: scale("accent"), // Ámbar: acentos, destacados y precios
        ink: scale("ink"), // Neutros petróleo: fondos, superficies, bordes y texto
      },
    },
  },
  plugins: [],
};
export default config;
