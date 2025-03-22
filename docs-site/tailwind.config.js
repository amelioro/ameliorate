/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,md,mdx}"],
  important: "#__next",
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: "x:", // match nextra's tailwind prefix https://the-guild.dev/blog/nextra-4#migrated-to-tailwind-css-4
};

export default config;
