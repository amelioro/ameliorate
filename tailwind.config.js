/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  important: "#__next",
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // MUI already adds a preflight (CssBaseline)
  },
};

export default config;
