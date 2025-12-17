/**
 * This JS config is loaded via the @config directive in globals.css.
 *
 * JS Tailwind config is considered legacy in favor of Tailwind v4's CSS-first @theme approach, but
 * we need to use JS in order to add our custom MUI palette to Tailwind. I'm not aware of a way to
 * do this with the CSS-only approach, since we use MUI's `createTheme()` to dynamically generate
 * additional color variants (e.g. light, dark, contrastText).
 */
import { createTheme } from "@mui/material/styles";

import { getThemeOptions } from "./src/web/common/theme";

const muiExplicitPalette = getThemeOptions("light").palette;
const muiGeneratedPalette = createTheme({ palette: muiExplicitPalette }).palette;

// Add mui palette to tailwind.
// we want all the colors from the mui palette, but we explicitly specify some of the generated
// colors because the generated palette includes a bunch of functions that aren't just colors.
const muiColorsToExtend = {
  ...muiExplicitPalette,
  primary: muiGeneratedPalette.primary,
  error: muiGeneratedPalette.error,
  warning: muiGeneratedPalette.warning,
  info: muiGeneratedPalette.info,
  success: muiGeneratedPalette.success,
  text: muiGeneratedPalette.text,
  background: muiGeneratedPalette.background,
};

/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      colors: {
        ...muiColorsToExtend,
      },
    },
  },
};

export default config;
