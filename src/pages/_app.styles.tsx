import { css } from "@emotion/react";

export const globals = css`
  html {
    scroll-behavior: smooth;
  }

  #__next {
    // allow loading icon to be centered in viewport while page is loading
    min-height: calc(100svh - 49px); // subtract height of navbar
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
