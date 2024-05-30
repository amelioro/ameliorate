// used material color palettes to find complement https://material.io/design/color/the-color-system.html#tools-for-picking-colors
// used material color tool to confirm accessibility (legibility) https://material.io/resources/color/#!/?view.left=1&view.right=1&primary.color=4ab74c&secondary.color=b74ab5
// used mui-theme-creator to see the colors in action and pick light & dark palettes https://bareynol.github.io/mui-theme-creator/?firstName=&lastName=&email=&password=
// color names from color-name.com
// used color calculator for complementary, analagous colors https://www.sessions.edu/color-calculator/

import {
  type Theme as MaterialUITheme,
  type PaletteMode,
  type ThemeOptions,
  createTheme,
} from "@mui/material";
import { grey, orange, yellow } from "@mui/material/colors";

import { FlowNodeType } from "@/web/topic/utils/node";

// adding colors to theme documented at https://mui.com/material-ui/customization/palette/#adding-new-colors

/* eslint-disable @typescript-eslint/no-empty-interface -- interfaces are not same as superclass because we're augmenting the module's existing interfaces */
declare module "@mui/material/styles" {
  // bit awkward but don't think it's possible to create keys for each NodeType in an interface without creating this intermediate type
  // thanks https://stackoverflow.com/a/60378992
  type NodeTypePalettes = { [key in FlowNodeType]: Palette["primary"] };
  type NodeTypePaletteOptions = { [key in FlowNodeType]: PaletteOptions["primary"] };

  interface Palette extends NodeTypePalettes {
    primaryVariantDark: Palette["primary"];
    primaryVariantLight: Palette["primary"];
    neutral: Palette["primary"];
    neutralContrast: Palette["primary"];
    paper: Palette["primary"];
    support1: Palette["primary"];
    support2: Palette["primary"];
    support3: Palette["primary"];
    support4: Palette["primary"];
    critique1: Palette["primary"];
    critique2: Palette["primary"];
    critique3: Palette["primary"];
    critique4: Palette["primary"];
  }

  interface PaletteOptions extends NodeTypePaletteOptions {
    primaryVariantDark: PaletteOptions["primary"];
    primaryVariantLight: PaletteOptions["primary"];
    neutral: PaletteOptions["primary"];
    neutralContrast: PaletteOptions["primary"];
    paper: PaletteOptions["primary"];
    support1: PaletteOptions["primary"];
    support2: PaletteOptions["primary"];
    support3: PaletteOptions["primary"];
    support4: PaletteOptions["primary"];
    critique1: PaletteOptions["primary"];
    critique2: PaletteOptions["primary"];
    critique3: PaletteOptions["primary"];
    critique4: PaletteOptions["primary"];
  }
}

declare module "@mui/material" {
  type NodeTypeColors = { [key in FlowNodeType]: true };

  interface ButtonPropsColorOverrides extends NodeTypeColors {
    primaryVariantDark: true;
    primaryVariantLight: true;
    neutral: true;
    neutralContrast: true;
    paper: true;
    support1: true;
    support2: true;
    support3: true;
    support4: true;
    critique1: true;
    critique2: true;
    critique3: true;
    critique4: true;
  }

  interface AppBarPropsColorOverrides extends NodeTypeColors {
    primaryVariantDark: true;
    primaryVariantLight: true;
    neutral: true;
    neutralContrast: true;
    paper: true;
    support1: true;
    support2: true;
    support3: true;
    support4: true;
    critique1: true;
    critique2: true;
    critique3: true;
    critique4: true;
  }

  interface SvgIconPropsColorOverrides extends NodeTypeColors {
    primaryVariantDark: true;
    primaryVariantLight: true;
    neutral: true;
    neutralContrast: true;
    paper: true;
    support1: true;
    support2: true;
    support3: true;
    support4: true;
    critique1: true;
    critique2: true;
    critique3: true;
    critique4: true;
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
const primaryVariantLight = "#82CE84"; // 200 lower than primary on material design color tool
const secondary = "#B84AB4"; // deep fuchsia (purple): truth; complementary to primary
export const infoColor = "#0288d1"; // mui default info https://mui.com/material-ui/customization/palette/#values
const { palette } = createTheme();
const { augmentColor } = palette; // automatically creates light and dark colors too, thanks https://stackoverflow.com/a/69836010

const sharedPalette = {
  primary: { main: primary },
  info: { main: infoColor },

  // material design recommends variants for contrasting UI elements, see Primary Colors at https://m2.material.io/design/color/the-color-system.html#color-theme-creation
  primaryVariantDark: { main: "#359639" }, // 200 higher than primary on material design color tool
  primaryVariantLight: { main: primaryVariantLight },

  // use black contrast text for consistency with other node colors; accessibility tool indicates black is still accessible
  secondary: { main: secondary, contrastText: "rgba(0, 0, 0, 0.87)" },
  neutral: augmentColor({ color: { main: "#BDBDBD" } }), // gray is very neutral, somewhat arbitrarily chosen, no particular relation to the other colors
  neutralContrast: augmentColor({ color: { main: "#000000" } }), // black contrasts with gray, separate from neutral.contrastText so that it gets its own augments I guess
  paper: augmentColor({ color: { main: "#fff" } }), // used for neutral-but-chosen score

  // topic
  problem: augmentColor({ color: { main: secondary, contrastText: "rgba(0, 0, 0, 0.87)" } }),
  cause: augmentColor({ color: { main: "#D795D3" } }), // 200 lower than problem color on material design color tool
  solution: augmentColor({ color: { main: primary } }),
  solutionComponent: augmentColor({ color: { main: primaryVariantLight } }),
  criterion: augmentColor({ color: { main: "#4AB885" } }), // mint: analogous to solution; between solution & support because criteria are kind of like supports for solutions
  effect: augmentColor({ color: { main: yellow[500] } }), // random yellow that looks decent: somewhat similar to green/solution but also goes well with lightning bolt icon
  benefit: augmentColor({ color: { main: "#A0DC46" } }), // calculated analogous color to effect, solution, and support
  detriment: augmentColor({ color: { main: "#DC477B", contrastText: "rgba(0, 0, 0, 0.87)" } }), // calculated analogous color to effect, problem, and critique
  obstacle: augmentColor({ color: { main: "#C26586", contrastText: "rgba(0, 0, 0, 0.87)" } }), // calculated monochromatic color to detriment (hard to find a decent color, butobstaclen's relation to solution is kind of similar to detriment's)

  // research - palette https://coolors.co/9e9e9e-f57c00-0288d1-04f06a-1c110a
  question: augmentColor({ color: { main: grey[500] } }), // grey, ambiguous, uncertain
  answer: augmentColor({ color: { main: "#04f06a" } }), // spring green, green like answer/good, but distinct from solution's green
  fact: augmentColor({ color: { main: orange["700"] } }), // orange, fact
  source: augmentColor({ color: { main: "#0288d1", contrastText: "rgba(0, 0, 0, 0.87)" } }), // blue, info

  // claim
  rootClaim: augmentColor({ color: { main: "#DA9526" } }), // goldenrod (gold): somewhat neutral; analogous to critique
  // Picked a non-green support-ish color (cyan) for support #26C5DA, grabbed its complement #DA2626 (red-orange) for critique,
  // then entered those into the material 3 theme builder and grabbed 5 tones from each of those two colors' tonal palettes.
  // The numbered support & critique colors are used for coloring scores.
  // Material 3 theme builder: https://m3.material.io/theme-builder#/custom
  support: augmentColor({ color: { main: "#0bbcd1" } }),
  support1: augmentColor({ color: { main: "#47d8ee" } }),
  support2: augmentColor({ color: { main: "#9af0ff" } }),
  support3: augmentColor({ color: { main: "#d1f8ff" } }),
  support4: augmentColor({ color: { main: "#edfcff" } }),
  critique: augmentColor({ color: { main: "#ff553d", contrastText: "rgba(0, 0, 0, 0.87)" } }),
  critique1: augmentColor({ color: { main: "#ff8a76", contrastText: "rgba(0, 0, 0, 0.87)" } }),
  critique2: augmentColor({ color: { main: "#ffb4a7", contrastText: "rgba(0, 0, 0, 0.87)" } }),
  critique3: augmentColor({ color: { main: "#ffdad4", contrastText: "rgba(0, 0, 0, 0.87)" } }),
  critique4: augmentColor({ color: { main: "#ffedea", contrastText: "rgba(0, 0, 0, 0.87)" } }),

  // generic
  custom: augmentColor({ color: { main: "#ffffff" } }), // neutral white
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- document won't be defined when rendered server-side
const rootElement = typeof document !== "undefined" ? document.getElementById("__next") : null;

export const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  breakpoints: {
    values: {
      // Most design for mobile should be the same, but most mobile devices (97%? https://worship.agency/mobile-screen-sizes-for-2022-based-on-data-from-2021)
      // are above 360px wide, so if we need to squeeze out space, we can target 360px+ and have just an ok design for below 360px
      xs: 360,

      // these are mui defaults
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode,
    ...sharedPalette,
    ...(mode === "light" ? lightPalette : darkPalette),
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: "min(18.75rem, 100vw - 2rem)",
        },
      },
    },
    MuiList: {
      defaultProps: {
        dense: true,
      },
    },
    MuiListItem: {
      defaultProps: {
        // Intended for list item buttons, so that the hover effect uses the whole row.
        // List item buttons have their own padding, but other list items do not, so those will need
        // to un-disable this. We're defaulting because it seems that most list items are buttons.
        disablePadding: true,
      },
    },

    // target root element for Portal-related elements, for tailwind support https://mui.com/material-ui/integrations/interoperability/#setup
    MuiPopover: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiPopper: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiDialog: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiModal: {
      defaultProps: {
        container: rootElement,
      },
    },
  },
});
