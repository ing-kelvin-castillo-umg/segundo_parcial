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
        harbor: {
          50: "#eefdf8",
          100: "#d4f8eb",
          200: "#9fead3",
          300: "#63d6bb",
          400: "#2fb89d",
          500: "#168f7d",
          600: "#0f7468",
          700: "#115d55",
          800: "#124b46",
          900: "#0b302f",
          950: "#061f20",
        },
        coral: {
          50: "#fff3ef",
          100: "#ffe1d8",
          200: "#ffc5b4",
          300: "#ff9b7b",
          400: "#fb724a",
          500: "#ef542f",
          600: "#d63f21",
          700: "#b2311b",
          800: "#932b1b",
          900: "#79291d",
        },
        citrus: {
          50: "#fbfde8",
          100: "#f2f8c4",
          200: "#e4ef8d",
          300: "#d2e052",
          400: "#bdca2b",
          500: "#99a31b",
          600: "#777f16",
          700: "#5d6416",
          800: "#4c5018",
          900: "#41451a",
        },
      }
    },
  },
  plugins: [],
};
export default config;
