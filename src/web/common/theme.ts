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
 * 230 mitigation, component (desaturated)
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
  PaletteColor,
  PaletteColorOptions,
  type PaletteMode,
  type ThemeOptions,
  createTheme,
} from "@mui/material";
import { createEmotionCache } from "@mui/material-nextjs/v14-pagesRouter";
import Color from "colorjs.io";

import { type FlowNodeType } from "@/web/topic/utils/node";

// adding colors to theme documented at https://mui.com/material-ui/customization/palette/#adding-new-colors

declare module "@mui/material/styles" {
  // bit awkward but don't think it's possible to create keys for each NodeType in an interface without creating this intermediate type
  // thanks https://stackoverflow.com/a/60378992
  type NodeTypePalettes = Record<FlowNodeType, PaletteColor>;
  type NodeTypePaletteOptions = Record<FlowNodeType, PaletteColorOptions>;

  interface Palette extends NodeTypePalettes {
    neutral: PaletteColor;
    neutralContrast: PaletteColor;
    paperPlain: PaletteColor;
    paperShaded: PaletteColor;
    support1: PaletteColor;
    support2: PaletteColor;
    support3: PaletteColor;
    support4: PaletteColor;
    critique1: PaletteColor;
    critique2: PaletteColor;
    critique3: PaletteColor;
    critique4: PaletteColor;
  }

  interface PaletteOptions extends NodeTypePaletteOptions {
    neutral: PaletteColorOptions;
    neutralContrast: PaletteColorOptions;
    paperPlain: PaletteColorOptions;
    paperShaded: PaletteColorOptions;
    support1: PaletteColorOptions;
    support2: PaletteColorOptions;
    support3: PaletteColorOptions;
    support4: PaletteColorOptions;
    critique1: PaletteColorOptions;
    critique2: PaletteColorOptions;
    critique3: PaletteColorOptions;
    critique4: PaletteColorOptions;
  }

  interface BreakpointOverrides {
    xs: false;
    "2xl": true;
  }
}

declare module "@mui/material" {
  type NodeTypeColors = Record<FlowNodeType, true>;

  interface ButtonPropsColorOverrides extends NodeTypeColors {
    neutral: true;
    neutralContrast: true;
    paperPlain: true;
    paperShaded: true;
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
    paperPlain: true;
    paperShaded: true;
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
    paperPlain: true;
    paperShaded: true;
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

// augment emotion theme to include Material methods (for use with styled)
// https://github.com/emotion-js/emotion/discussions/2291#discussioncomment-491185
declare module "@emotion/react" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- empty to extend the module
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
  paperPlain: augmentColor({ color: { main: "#fff" } }), // used for neutral-but-chosen score, plain backgrounds
  paperShaded: augmentColor({ color: { main: "#f9fafb" } }), // bg-gray-50; more gray-ish to contrast slightly with paperPlain, e.g. for toolbar backgrounds

  // topic
  problem: augmentColor({ color: { main: oklchToHex("oklch(75% 0.15 300)") } }), // purple: truth; complementary to solution; no increased saturation because its hue stands out already
  cause: augmentColor({ color: { main: oklchToHex("oklch(70% 0.15 320)") } }), // light-purple: bad, so similar color to problem, darker to contrast more with detriment
  solution: augmentColor({ color: { main: oklchToHex("oklch(70% 0.15 140)") } }), // green: good, optimistic, let's solve things; darkened to give it what seems like a nicer color, and distinguish from component.
  solutionComponent: augmentColor({ color: { main: oklchToHex("oklch(75% 0.09 140)") } }), // grey-green: same as solution but with less saturation
  criterion: augmentColor({ color: { main: oklchToHex("oklch(75% 0.10 160)") } }), // green-blue: between solution & support colors because criteria are kind of like supports for solutions
  effect: augmentColor({ color: { main: oklchToHex("oklch(85% 0.15 100)") } }), // yellow: goes well with lightning icon
  benefit: augmentColor({ color: { main: oklchToHex("oklch(85% 0.16 130)") } }), // light-green: good thing; slightly more saturated because the color seems nicer, brighter to contrast more with other greens (mainly solution/component)
  detriment: augmentColor({ color: { main: oklchToHex("oklch(85% 0.15 340)") } }), // purple-red: bad thing; slightly brighter to contrast more with cause
  obstacle: augmentColor({ color: { main: oklchToHex("oklch(75% 0.15 0)") } }), // red: bad thing
  mitigation: augmentColor({ color: { main: oklchToHex("oklch(75% 0.11 230)") } }), // blue: good but different than solution/support; desaturated because the hue seems to naturally be very saturated
  mitigationComponent: augmentColor({ color: { main: oklchToHex("oklch(75% 0.07 230)") } }), // grey-blue: same as mitigation but with less saturation

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
  custom: augmentColor({ color: { main: oklchToHex("oklch(90% 0 0)") } }), // neutral gray for customizable, darker than white to have some contrast, lighter than question-gray to distinguish
};

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

/**
 * This cache needs to be the same one used for `_document.page.tsx` and `_app.page.tsx` or layering won't work.
 *
 * The example for ensuring MUI styles are properly layered shows the `_app.page.tsx` having the
 * cache in its params, but our nextjs version doesn't support that... maybe it's in v15? https://mui.com/material-ui/integrations/nextjs/#configuration-2
 *
 * So when we upgrade from nextjs 14 to 15 or 16, maybe we can instantiate this and use it in one file (document.page.tsx?).
 */
export const clientEmotionCache = createEmotionCache({ key: "css", enableCssLayer: true });
