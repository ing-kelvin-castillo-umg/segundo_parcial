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
        forest: {
          50: '#eef5ef', 100: '#d9e9dc', 200: '#b5d3bc',
          300: '#83b491', 400: '#52936c', 500: '#347856',
          600: '#286047', 700: '#204d3b', 800: '#1c3e31',
          900: '#173329', 950: '#0c211b',
        },
        mint: {
          50: '#ecfbf6', 100: '#d2f5e7', 200: '#a8e9d2',
          300: '#72d6b5', 400: '#39b78e', 500: '#1d9672',
          600: '#14795d', 700: '#13604c', 800: '#124d3d',
          900: '#103f34',
        },
        gold: {
          50: '#fcf9ec', 100: '#f8edc9', 200: '#f1db91',
          300: '#e8c45b', 400: '#d9a735', 500: '#bd8623',
          600: '#98671e', 700: '#754e1c', 800: '#60411e',
          900: '#52391e',
        },
        paper: '#f7f5ed',
        ink: '#172b23',
      }
    },
  },
  plugins: [],
};
export default config;
