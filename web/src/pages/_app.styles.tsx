import { css } from "@emotion/react";

export const globals = css`
  a {
    color: inherit;
    text-decoration: none;
  }

  #__next {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1; // stretch to fill space between layout app bar and viewport bottom
    display: flex;
    flex-direction: column; // allow child diagram to stretch to fill space
  }
`;
