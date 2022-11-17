// used material color palettes to find complement https://material.io/design/color/the-color-system.html#tools-for-picking-colors
// used material color tool to confirm accessibility (legibility) https://material.io/resources/color/#!/?view.left=1&view.right=1&primary.color=4ab74c&secondary.color=b74ab5
// used mui-theme-creator to see the colors in action and pick light & dark palettes https://bareynol.github.io/mui-theme-creator/?firstName=&lastName=&email=&password=

import {
  type Theme as MaterialUITheme,
  type PaletteMode,
  type ThemeOptions,
  createTheme,
} from "@mui/material";

// adding colors to theme documented at https://mui.com/material-ui/customization/palette/#adding-new-colors
declare module "@mui/material/styles" {
  interface Palette {
    problem: Palette["primary"];
    solution: Palette["primary"];
  }

  interface PaletteOptions {
    problem: PaletteOptions["primary"];
    solution: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    problem: true;
    solution: true;
  }
}

// augment emotion theme to include Material methods (for use with styled)
// https://github.com/emotion-js/emotion/discussions/2291#discussioncomment-491185
declare module "@emotion/react" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends MaterialUITheme {}
}

const lightPalette = {
  // background: {
  //   default: "#fafafa",
  // },
};

const darkPalette = {
  // background: {
  //   default: "#303030",
  //   paper: "rgb(35, 35, 35)",
  // },
};

const primary = "#4ab74c";
const secondary = "#b84ab6"; // slightly darker so that text isn't white?
const { palette } = createTheme();
const { augmentColor } = palette; // automatically creates light and dark colors too, thanks https://stackoverflow.com/a/69836010

const sharedPalette = {
  primary: {
    main: primary, // green: good, optimistic, let's solve things
  },
  secondary: {
    main: secondary, // purple: truth, complementary to green
  },
  problem: augmentColor({ color: { main: secondary } }),
  solution: augmentColor({ color: { main: primary } }),
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
