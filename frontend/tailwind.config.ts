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
          50: '#effaf6',
          100: '#d8f3e9',
          200: '#b1e7d2',
          300: '#79d4b4',
          400: '#43b995',
          500: '#16856f',
          600: '#116b5b',
          700: '#0e564b',
          800: '#0c443d',
          900: '#092f2c',
        },
        amberline: {
          400: '#f2b84b',
          500: '#d9922e',
        }
      }
    },
  },
  plugins: [],
};
export default config;
