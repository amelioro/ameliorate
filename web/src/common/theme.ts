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

import { NodeType } from "../modules/topic/utils/nodes";

// adding colors to theme documented at https://mui.com/material-ui/customization/palette/#adding-new-colors

/* eslint-disable @typescript-eslint/no-empty-interface -- interfaces are not same as superclass because we're augmenting the module's existing interfaces */
declare module "@mui/material/styles" {
  // bit awkward but don't think it's possible to create keys for each NodeType in an interface without creating this intermediate type
  // thanks https://stackoverflow.com/a/60378992
  type NodeTypePalettes = { [key in NodeType]: Palette["primary"] };
  type NodeTypePaletteOptions = { [key in NodeType]: PaletteOptions["primary"] };

  interface Palette extends NodeTypePalettes {
    primaryVariantDark: Palette["primary"];
    primaryVariantLight: Palette["primary"];
    neutral: Palette["primary"];
    neutralContrast: Palette["primary"];
  }

  interface PaletteOptions extends NodeTypePaletteOptions {
    primaryVariantDark: PaletteOptions["primary"];
    primaryVariantLight: PaletteOptions["primary"];
    neutral: PaletteOptions["primary"];
    neutralContrast: PaletteOptions["primary"];
  }
}

declare module "@mui/material" {
  type NodeTypeColors = { [key in NodeType]: true };

  interface ButtonPropsColorOverrides extends NodeTypeColors {
    primaryVariantDark: true;
    primaryVariantLight: true;
    neutral: true;
    neutralContrast: true;
  }

  interface AppBarPropsColorOverrides extends NodeTypeColors {
    primaryVariantDark: true;
    primaryVariantLight: true;
    neutral: true;
    neutralContrast: true;
  }

  interface SvgIconPropsColorOverrides extends NodeTypeColors {
    primaryVariantDark: true;
    primaryVariantLight: true;
    neutral: true;
    neutralContrast: true;
  }
}
/* eslint-disable @typescript-eslint/no-empty-interface */

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
  // material design recommends variants for contrasting UI elements, see Primary Colors at https://m2.material.io/design/color/the-color-system.html#color-theme-creation
  primaryVariantDark: { main: "#359639" }, // 200 higher than primary on material design color tool
  primaryVariantLight: { main: "#82CE84" }, // 200 lower than primary on material design color tool
  // use black contrast text for consistency with other node colors; accessibility tool indicates black is still accessible
  secondary: { main: secondary, contrastText: "rgba(0, 0, 0, 0.87)" },
  neutral: augmentColor({ color: { main: "#BDBDBD" } }), // gray is very neutral, somewhat arbitrarily chosen, no particular relation to the other colors
  neutralContrast: augmentColor({ color: { main: "#000000" } }), // black contrasts with gray, separate from neutral.contrastText so that it gets its own augments I guess
  problem: augmentColor({ color: { main: secondary, contrastText: "rgba(0, 0, 0, 0.87)" } }),
  solution: augmentColor({ color: { main: primary } }),
  criterion: augmentColor({ color: { main: "#4AB885" } }), // mint: analogous to solution; between solution & support because criteria are kind of like supports for solutions
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
        margin: 1,
      },
    },
  },
});
