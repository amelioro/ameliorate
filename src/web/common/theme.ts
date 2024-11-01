/**
 * Resources:
 * - For seeing which OKLCH colors can be rendered, what LCH combinations look like: https://oklch.com/
 * - For testing WCAG 2.1 contrast with white/black text: https://lea.verou.me/blog/2024/contrast-color/#does-this-mythical-l-threshold-actually-exist%3F
 * - For identifying roughly complementary/analogous colors https://www.sessions.edu/color-calculator/
 *
 * General strategy for node colors:
 * - reds/purples represent bad things,
 * - greens/blues represent good things,
 * - yellows/hue-less represent neutral things.
 *
 * For most nodes, used 75% Lightness and 0.15 Chroma, because most Hues pass WCAG 2.1 AA for black text
 * Some blues have reduced saturation because their hue seems naturally saturated.
 *
 * Node hues should be chosen to be distinct from other nodes that would typically be adjacent.
 * Lightness/Chroma can be manually adjusted to make the colors more or less distinct.
 *
 * Node colors across the 0-360 hue space:
 * 0 obstacle
 * 20 critique
 * 60 fact
 * 80 root claim
 * 100 effect
 * 130 benefit
 * 138 solution, component (desaturated)
 * 150 answer
 * 160 criterion
 * 200 support
 * 240 source
 * 300 problem
 * 320 cause
 * 340 detriment
 *
 * Node colors that are independent of hue:
 * 0 custom
 * 0 question
 */

import {
  type Theme as MaterialUITheme,
  type PaletteMode,
  type ThemeOptions,
  createTheme,
} from "@mui/material";
import Color from "colorjs.io";

import { type FlowNodeType } from "@/web/topic/utils/node";

// adding colors to theme documented at https://mui.com/material-ui/customization/palette/#adding-new-colors

/* eslint-disable @typescript-eslint/no-empty-interface -- interfaces are not same as superclass because we're augmenting the module's existing interfaces */
declare module "@mui/material/styles" {
  // bit awkward but don't think it's possible to create keys for each NodeType in an interface without creating this intermediate type
  // thanks https://stackoverflow.com/a/60378992
  type NodeTypePalettes = { [key in FlowNodeType]: Palette["primary"] };
  type NodeTypePaletteOptions = { [key in FlowNodeType]: PaletteOptions["primary"] };

  interface Palette extends NodeTypePalettes {
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

  interface BreakpointOverrides {
    xs: false;
    "2xl": true;
  }
}

declare module "@mui/material" {
  type NodeTypeColors = { [key in FlowNodeType]: true };

  interface ButtonPropsColorOverrides extends NodeTypeColors {
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

/**
 * MUI doesn't support `oklch(string)` for its theme yet, so we have to convert to hex
 *
 * See https://github.com/mui/material-ui/issues/41728
 */
const oklchToHex = (oklchStr: string): string => {
  return new Color(oklchStr).to("srgb").toString({ format: "hex" });
};

const { palette } = createTheme();
const { augmentColor } = palette; // automatically creates light and dark colors too, thanks https://stackoverflow.com/a/69836010
export const infoColor = "#0288D1"; // mui default info https://mui.com/material-ui/customization/palette/#values

const sharedPalette = {
  primary: { main: "#4AB84E" }, // apple (green): good, optimistic, let's solve things; different from solution because this is too dark for contrasting with black small node text, but solution color is too light from using for text on white background
  info: { main: infoColor },

  neutral: augmentColor({ color: { main: oklchToHex("oklch(91% 0 0)") } }), // gray is very neutral, light-ish to not stand out too much, no particular relation to the other colors
  neutralContrast: augmentColor({ color: { main: "#000000" } }), // black contrasts with gray, separate from neutral.contrastText so that it gets its own augments I guess
  paper: augmentColor({ color: { main: "#fff" } }), // used for neutral-but-chosen score

  // topic
  problem: augmentColor({ color: { main: oklchToHex("oklch(75% 0.15 300)") } }), // purple: truth; complementary to solution; no increased saturation because its hue stands out already
  cause: augmentColor({ color: { main: oklchToHex("oklch(70% 0.15 320)") } }), // light-purple: bad, so similar color to problem, darker to contrast more with detriment
  solution: augmentColor({ color: { main: oklchToHex("oklch(75% 0.24 140)") } }), // green: good, optimistic, let's solve things; increased saturation to help it stand out
  solutionComponent: augmentColor({ color: { main: oklchToHex("oklch(75% 0.12 140)") } }), // grey-green: same as solution but with less saturation
  criterion: augmentColor({ color: { main: oklchToHex("oklch(75% 0.10 160)") } }), // green-blue: between solution & support colors because criteria are kind of like supports for solutions
  effect: augmentColor({ color: { main: oklchToHex("oklch(85% 0.15 100)") } }), // yellow: goes well with lightning icon
  benefit: augmentColor({ color: { main: oklchToHex("oklch(85% 0.16 130)") } }), // light-green: good thing; slightly more saturated because the color seems nicer, brighter to contrast more with other greens (mainly solution/component)
  detriment: augmentColor({ color: { main: oklchToHex("oklch(85% 0.15 340)") } }), // purple-red: bad thing; slightly brighter to contrast more with cause
  obstacle: augmentColor({ color: { main: oklchToHex("oklch(75% 0.15 0)") } }), // red: bad thing

  // research
  question: augmentColor({ color: { main: oklchToHex("oklch(75% 0 0)") } }), // grey: ambiguous, uncertain
  answer: augmentColor({ color: { main: oklchToHex("oklch(75% 0.15 150)") } }), // mint green: green like answer/good, but distinct from solution's green
  fact: augmentColor({ color: { main: oklchToHex("oklch(75% 0.15 60)") } }), // orange: neutral, fact
  source: augmentColor({ color: { main: oklchToHex("oklch(75% 0.12 240)") } }), // blue: info

  // justification
  rootClaim: augmentColor({ color: { main: oklchToHex("oklch(75% 0.15 80)") } }), // gold: somewhat neutral; analogous to critique
  // support blue and critique red are roughly complements
  // To generate shades, start slightly lighter than the main color, make similar steps in lightness/chroma, towards 100% lightness/0 chroma.
  // Start darker than main support color so that it could follow the same lightness/chroma steps as critiques.
  // First support color is also too saturated if it follows the same steps as critiques, so that one is desaturated.
  // Also had to adjust steps so that the colors are within rgb gamut.
  support: augmentColor({ color: { main: oklchToHex("oklch(80% 0.09 200)") } }),
  support1: augmentColor({ color: { main: oklchToHex("oklch(81% 0.10 200)") } }),
  support2: augmentColor({ color: { main: oklchToHex("oklch(87% 0.06 200)") } }),
  support3: augmentColor({ color: { main: oklchToHex("oklch(93% 0.03 200)") } }),
  support4: augmentColor({ color: { main: oklchToHex("oklch(97% 0.014 200)") } }),

  critique: augmentColor({ color: { main: oklchToHex("oklch(75% 0.15 20)") } }),
  critique1: augmentColor({ color: { main: oklchToHex("oklch(81% 0.10 20)") } }),
  critique2: augmentColor({ color: { main: oklchToHex("oklch(87% 0.06 20)") } }),
  critique3: augmentColor({ color: { main: oklchToHex("oklch(93% 0.03 20)") } }),
  critique4: augmentColor({ color: { main: oklchToHex("oklch(97% 0.014 20)") } }),

  // generic
  custom: augmentColor({ color: { main: "#ffffff" } }), // neutral white
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- document won't be defined when rendered server-side
const rootElement = typeof document !== "undefined" ? document.getElementById("__next") : null;

export const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  breakpoints: {
    values: {
      // match tailwind defaults https://tailwindcss.com/docs/screens
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      "2xl": 1536,
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
