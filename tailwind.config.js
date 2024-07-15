import createPalette from "@mui/material/styles/createPalette";

import { getThemeOptions } from "./src/web/common/theme";

const muiExplicitPalette = getThemeOptions("light").palette;
const muiGeneratedPalette = createPalette(muiExplicitPalette);

// Add mui palette to tailwind.
// we want all the colors from the mui palette, but we explicitly specify some of the generated
// colors because the generated palette includes a bunch of functions that aren't just colors.
const muiColorsToExtend = {
  ...muiExplicitPalette,
  primary: muiGeneratedPalette.primary,
  secondary: muiGeneratedPalette.secondary,
  error: muiGeneratedPalette.error,
  warning: muiGeneratedPalette.warning,
  info: muiGeneratedPalette.info,
  success: muiGeneratedPalette.success,
  text: muiGeneratedPalette.text,
  background: muiGeneratedPalette.background,
  paper: muiGeneratedPalette.paper,
};

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  important: "#__next",
  theme: {
    extend: {
      colors: {
        ...muiColorsToExtend,
      },
    },
  },
  plugins: [],
  corePlugins: {
    // MUI says to set tailwind preflight to false because it can break things https://mui.com/material-ui/integrations/interoperability/#tailwind-css
    // but some tailwind styles are awkward without it, e.g. using dividers https://tailwindcss.com/docs/divide-width requires that you also have border-style set (with the preflight, border-style defaults to solid).
    // Going to comment it out for now to get the benefit of tailwind's preflight, but if there are
    // issues with both preflights, we can set it back to false and do something like this https://github.com/tailwindlabs/tailwindcss/discussions/11290#discussioncomment-7783598.
    // preflight: false, // MUI already adds a preflight (CssBaseline)
  },
};

export default config;
