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
        plum: '#3C183C',
        lavender: '#D2CBFE',
        lime: '#CDFC8A',
        forest: '#022E21',
        brand: {
          50: '#f7f5ff',
          100: '#ebe8ff',
          200: '#D2CBFE',
          300: '#b7acf8',
          400: '#9484dc',
          500: '#6f5bb2',
          600: '#553d8f',
          700: '#3C183C',
          800: '#2d122e',
          900: '#022E21',
        }
      }
    },
  },
  plugins: [],
};
export default config;
