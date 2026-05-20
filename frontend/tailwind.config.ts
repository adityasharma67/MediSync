import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecfdf5",
          100: "#d9f2ee",
          200: "#a7f3d0",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0f766e",
          700: "#115e59",
          800: "#134e4a",
          900: "#0f3733",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffe6dc",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#e36f4f",
          600: "#d95f3d",
          700: "#b9472f",
          800: "#96391f",
          900: "#7c2d12",
        },
      },
      boxShadow: {
        soft: "0 20px 60px rgba(28, 48, 38, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
