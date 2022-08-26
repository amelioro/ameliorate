// used material color palettes to find complement https://material.io/design/color/the-color-system.html#tools-for-picking-colors
// used material color tool to confirm accessibility (legibility) https://material.io/resources/color/#!/?view.left=1&view.right=1&primary.color=4ab74c&secondary.color=b74ab5
// used mui-theme-creator to see the colors in action and pick light & dark palettes https://bareynol.github.io/mui-theme-creator/?firstName=&lastName=&email=&password=

import { type PaletteMode, type ThemeOptions } from "@mui/material";

const lightPalette = {
  background: {
    default: "#fafafa",
  },
};

const darkPalette = {
  background: {
    default: "#303030",
    paper: "rgb(35, 35, 35)",
  },
};

const sharedPalette = {
  primary: {
    main: "#4ab74c", // green: good, optimistic, let's solve things
  },
  secondary: {
    main: "#b84ab6", // purple: truth, complementary to green
  },
};

export const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...sharedPalette,
    ...(mode === "light" ? lightPalette : darkPalette),
  },
  components: {
    MuiTypography: {
      defaultProps: {
        margin: "0.4em",
      },
    },
  },
});
