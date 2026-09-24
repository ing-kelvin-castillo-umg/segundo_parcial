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
        primary: {
          dark: "rgb(var(--color-primary-dark-rgb) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          medium: "rgb(var(--color-primary-medium-rgb) / <alpha-value>)",
          light: "rgb(var(--color-primary-light-rgb) / <alpha-value>)",
        },
        secondary: {
          dark: "rgb(var(--color-secondary-dark-rgb) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-secondary-rgb) / <alpha-value>)",
          light: "rgb(var(--color-secondary-light-rgb) / <alpha-value>)",
        },
        canvas: "rgb(var(--color-background-rgb) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface-rgb) / <alpha-value>)",
          secondary: "rgb(var(--color-surface-secondary-rgb) / <alpha-value>)",
        },
        ink: "rgb(var(--color-text-rgb) / <alpha-value>)",
        muted: "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
        outline: "rgb(var(--color-border-rgb) / <alpha-value>)",
        success: "rgb(var(--color-success-rgb) / <alpha-value>)",
        warning: "rgb(var(--color-warning-rgb) / <alpha-value>)",
        danger: "rgb(var(--color-error-rgb) / <alpha-value>)",
        info: "rgb(var(--color-info-rgb) / <alpha-value>)",
        dark: {
          background: "rgb(var(--color-dark-background-rgb) / <alpha-value>)",
          surface: "rgb(var(--color-dark-surface-rgb) / <alpha-value>)",
          text: "rgb(var(--color-dark-text-rgb) / <alpha-value>)",
          muted: "rgb(var(--color-dark-muted-rgb) / <alpha-value>)",
        },
      },
      boxShadow: {
        panel: "0 18px 50px -28px rgb(4 47 46 / 0.35)",
        lift: "0 18px 38px -20px rgb(15 118 110 / 0.42)",
      },
    },
  },
  plugins: [],
};
export default config;
