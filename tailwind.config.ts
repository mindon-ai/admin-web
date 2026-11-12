import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202b",
        muted: "#66717f",
        line: "#e3e8ee",
        brand: "#155eef",
        canvas: "#f5f7fa",
      },
      boxShadow: { card: "0 2px 12px rgba(24, 39, 75, .05)" },
    },
  },
  plugins: [],
};

export default config;
