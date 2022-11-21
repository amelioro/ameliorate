// used material color palettes to find complement https://material.io/design/color/the-color-system.html#tools-for-picking-colors
// used material color tool to confirm accessibility (legibility) https://material.io/resources/color/#!/?view.left=1&view.right=1&primary.color=4ab74c&secondary.color=b74ab5
// used mui-theme-creator to see the colors in action and pick light & dark palettes https://bareynol.github.io/mui-theme-creator/?firstName=&lastName=&email=&password=
// color names from color-name.com

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
    rootClaim: Palette["primary"];
    support: Palette["primary"];
    critique: Palette["primary"];
  }

  interface PaletteOptions {
    problem: PaletteOptions["primary"];
    solution: PaletteOptions["primary"];
    rootClaim: PaletteOptions["primary"];
    support: PaletteOptions["primary"];
    critique: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    problem: true;
    solution: true;
    rootClaim: true;
    support: true;
    critique: true;
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

const primary = "#4AB84E"; // apple (green): good, optimistic, let's solve things
const secondary = "#B84AB4"; // deep fuchsia (purple): truth; complementary to primary
const { palette } = createTheme();
const { augmentColor } = palette; // automatically creates light and dark colors too, thanks https://stackoverflow.com/a/69836010

const sharedPalette = {
  primary: { main: primary },
  secondary: { main: secondary },
  // use black contrast text for consistency with other node colors; accessibility tool indicates black is still accessible
  problem: augmentColor({ color: { main: secondary, contrastText: "rgba(0, 0, 0, 0.87)" } }),
  solution: augmentColor({ color: { main: primary } }),
  rootClaim: augmentColor({ color: { main: "#DA9526" } }), // goldenrod (gold): somewhat neutral; analogous to critique
  support: augmentColor({ color: { main: "#26C5DA" } }), // battery charged blue (cyan): non-green support-ish color; top color from https://zenoo.github.io/mui-theme-creator/
  critique: augmentColor({ color: { main: "#DA3B26", contrastText: "rgba(0, 0, 0, 0.87)" } }), // vermilion (red-orange): opposing; complementary to support
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
