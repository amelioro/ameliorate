import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { Spotlight, zIndex } from "../Diagram/Diagram.styles";

const highlightedEdgeWidth = "2px";

interface PathProps {
  spotlight: Spotlight;
}

const pathOptions = {
  shouldForwardProp: (prop: string) => !["spotlight"].includes(prop),
};

export const StyledPath = styled("path", pathOptions)<PathProps>`
  cursor: default;

  &.react-flow__edge-path {
    ${({ theme, spotlight }) => {
      if (spotlight === "primary") {
        return css`
          opacity: 1;
          stroke-width: ${highlightedEdgeWidth};
        `;
      } else if (spotlight === "secondary") {
        return css`
          // marker should be styled too but reactflow's default only styles this, and that's probably
          // because marker styles need to be specified when creating the marker element, without css
          stroke: ${theme.palette.info.main};
          stroke-width: ${highlightedEdgeWidth};
        `;
      }
    }}
  }
`;

interface DivProps {
  labelX: number;
  labelY: number;
  spotlight: Spotlight;
}

const divOptions = {
  shouldForwardProp: (prop: string) => !["labelX", "labelY", "spotlight"].includes(prop),
};

export const StyledDiv = styled("div", divOptions)<DivProps>`
  pointer-events: all;
  cursor: default;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: white;
  border: 1px solid #b1b1b7; // match edge stroke color that comes from react-flow default css
  border-radius: 15%;
  padding: 4px;

  ${({ labelX, labelY }) => css`
    position: absolute;
    transform: translate(-50%, -50%) translate(${labelX}px, ${labelY}px);
  `}

  ${({ theme, spotlight }) => {
    if (spotlight === "primary") {
      return css`
        border-color: #555;
        border-width: ${highlightedEdgeWidth};
        z-index: ${zIndex.primary};
      `;
    } else if (spotlight === "secondary") {
      return css`
        border-color: ${theme.palette.info.main};
        border-width: ${highlightedEdgeWidth};
        z-index: ${zIndex.secondary};
      `;
    }
  }}
`;
