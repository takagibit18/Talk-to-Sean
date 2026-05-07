import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#58a6ff",
        "accent-hover": "#79c0ff",
      },
      boxShadow: {
        glass: "0 4px 16px rgba(0,0,0,0.2)",
        "glass-hover": "0 8px 32px rgba(0,0,0,0.3)",
      },
    },
  },
};

export default config;
