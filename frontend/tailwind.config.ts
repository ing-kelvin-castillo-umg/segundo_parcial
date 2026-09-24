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
          50: '#ebf8f3',
          100: '#d2eee2',
          200: '#a9dec9',
          300: '#72c9a7',
          400: '#3eae85',
          500: '#1e946d',
          600: '#117a59',
          700: '#0d6048',
          800: '#104c3d',
          900: '#113e34',
          950: '#092821',
        },
        cream: '#f8f5ee',
        copper: '#d49460',
      }
    },
  },
  plugins: [],
};
export default config;
