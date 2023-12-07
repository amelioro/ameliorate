import { css } from "@emotion/react";

export const globals = css`
  html {
    scroll-behavior: smooth;
  }

  #__next {
    // vh runs into issue where bottom of page is cut off by mobile navbar, see https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport
    // so use svh if it's supported.
    height: 100vh;
    height: 100svh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1; // stretch to fill space between layout app bar and viewport bottom
    display: flex;
    flex-direction: column; // allow child diagram to stretch to fill space
    min-height: 0; // allow workspace to shrink to fit if drawer is too big https://stackoverflow.com/a/36247448/8409296
  }
`;
