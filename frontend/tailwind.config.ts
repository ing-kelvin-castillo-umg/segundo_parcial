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
          50: '#effcf7',
          100: '#d9f7eb',
          200: '#b6ecd8',
          300: '#83ddc0',
          400: '#46c6a1',
          500: '#16a47c',
          600: '#0a8465',
          700: '#076a54',
          800: '#075545',
          900: '#063f35',
          950: '#022d27',
        },
        accent: {
          50: '#fff9eb',
          100: '#fff0c8',
          200: '#ffdf8b',
          300: '#ffc44d',
          400: '#f6b52b',
          500: '#e99509',
          600: '#c97907',
          700: '#9f5d09',
          800: '#7f490e',
          900: '#693d0f',
          950: '#3d2104',
        },
      }
    },
  },
  plugins: [],
};
export default config;
