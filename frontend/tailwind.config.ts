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
          50: "#eefdf9",
          100: "#d4f8ee",
          200: "#aef0de",
          300: "#75e0c6",
          400: "#35c6aa",
          500: "#18a992",
          600: "#118675",
          700: "#126b60",
          800: "#12564f",
          900: "#0f4642",
        },
        ink: {
          50: "#f7f5f1",
          100: "#ece7df",
          200: "#d7cab9",
          300: "#bba78d",
          400: "#9f8463",
          500: "#846947",
          600: "#6b5438",
          700: "#4d3d2d",
          800: "#322a23",
          900: "#1c1917",
          950: "#11100e",
        },
        coral: {
          50: "#fff1ed",
          100: "#ffe0d6",
          200: "#ffc2b0",
          300: "#ff9a7c",
          400: "#fb6c48",
          500: "#ef4f2f",
          600: "#d7351d",
          700: "#b42918",
          800: "#942519",
          900: "#7a241b",
        },
        harvest: {
          50: "#fff8e6",
          100: "#ffedba",
          200: "#ffdb76",
          300: "#ffc233",
          400: "#f6a90b",
          500: "#d98500",
          600: "#b95f00",
          700: "#943f07",
          800: "#7a320c",
          900: "#682a10",
        },
      }
    },
  },
  plugins: [],
};
export default config;
