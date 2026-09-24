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
        lagoon: {
          50: '#eefbf8',
          100: '#d4f4ec',
          200: '#a9e7d8',
          300: '#72d4c1',
          400: '#39b9a6',
          500: '#1b9788',
          600: '#11796f',
          700: '#0e625c',
          800: '#0d4e4a',
          900: '#0b403d',
          950: '#062c2c',
        },
        sand: {
          50: '#fffaf0',
          100: '#fff0cc',
          200: '#ffdc91',
          300: '#f9c35b',
          400: '#eaa43c',
          500: '#c98520',
        },
      }
    },
  },
  plugins: [],
};
export default config;
