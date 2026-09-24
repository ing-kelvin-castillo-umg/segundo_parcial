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
          50: '#F0D9FF',
          100: '#E0BFFF',
          200: '#C89FE8',
          300: '#A97ECC',
          400: '#8A5DAE',
          500: '#5A2C66',
          600: '#492253',
          700: '#2F173A',
          800: '#1A1022',
          900: '#0A0710',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      }
    },
  },
  plugins: [],
};
export default config;
