/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,md,mdx}", "./theme.config.tsx"],
  important: "#__next",
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: "_", // match nextra's tailwind prefix https://the-guild.dev/blog/nextra-3#tailwind-css-classes-prefixes-now-have-_-prefix-instead-of-nx--eslint-disable-line-
};

export default config;
