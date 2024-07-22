/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,md,mdx}", "./theme.config.tsx"],
  important: "#__next",
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
