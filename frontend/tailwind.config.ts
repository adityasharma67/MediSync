import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        blob: "blob 7s infinite",
        fadeIn: "fadeIn 0.6s ease-in",
        slideIn: "slideIn 0.6s ease-out",
        slideUp: "slideUp 0.6s ease-out",
        scaleIn: "scaleIn 0.5s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        bounce_slow: "bounce_slow 3s ease-in-out infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        scaleIn: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        bounce_slow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
      },
      transitionDelay: {
        2000: "2000ms",
        4000: "4000ms",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(168, 85, 247, 0.5)",
        "glow-lg": "0 0 40px rgba(168, 85, 247, 0.6)",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, addComponents }) {
      addUtilities({
        ".animation-delay-2000": {
          "animation-delay": "2s",
        },
        ".animation-delay-4000": {
          "animation-delay": "4s",
        },
        ".animation-delay-500": {
          "animation-delay": "500ms",
        },
        ".animation-delay-1000": {
          "animation-delay": "1s",
        },
      });

      addComponents({
        ".glass": {
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "1.5px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        },
        ".glass-dark": {
          background: "rgba(30, 41, 59, 0.6)",
          backdropFilter: "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "1.5px solid rgba(148, 163, 184, 0.12)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        },
        ".btn-primary": {
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105": {},
        },
        ".btn-secondary": {
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300": {},
        },
      });
    }),
  ],
};
export default config;
