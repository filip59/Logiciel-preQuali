import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sapin : vert profond, sobre et rassurant (pas le bleu bancaire habituel)
        spruce: {
          50: "#EEF6F3",
          100: "#D6EAE3",
          200: "#AFD4C8",
          300: "#7FB8A6",
          400: "#4E9A84",
          500: "#2F7D68",
          600: "#1F6353",
          700: "#174D41",
          800: "#123D34",
          900: "#0D2E27",
        },
        // Doré : réservé à l'étape courante et au verrou du résultat
        gold: {
          100: "#FBF1D9",
          400: "#E0A93B",
          500: "#C8922B",
          700: "#8A611A",
        },
        ink: "#12211D",
        muted: "#586763",
        mist: "#F4F7F6",
        line: "#D8E1DE",
        danger: { DEFAULT: "#B3261E", bg: "#FCEDEB" },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
