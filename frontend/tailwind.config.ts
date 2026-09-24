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
          50: '#ecfdf9',
          100: '#d1faef',
          200: '#a7f3e3',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        aurora: {
          violet: '#8b5cf6',
          amber: '#f59e0b',
          cyan: '#22d3ee',
          ink: '#0b1020',
          panel: '#131a2e',
        }
      }
    },
  },
  plugins: [],
};
export default config;
