import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { infoColor } from "../../../common/theme";
import { Spotlight, zIndex } from "../Diagram/Diagram.styles";

const highlightedEdgeWidth = "2px";
export const edgeColor = "#b1b1b7"; // react flow default
export const highlightedEdgeColor = "#555"; // darker than react flow default

interface PathProps {
  spotlight: Spotlight;
}

const pathOptions = {
  shouldForwardProp: (prop: string) => !["spotlight"].includes(prop),
};

export const StyledPath = styled("path", pathOptions)<PathProps>`
  cursor: default;

  &.react-flow__edge-path {
    ${({ spotlight }) => {
      if (spotlight === "primary") {
        return css`
          opacity: 1;
          stroke-width: ${highlightedEdgeWidth};
        `;
      } else if (spotlight === "secondary") {
        return css`
          stroke: ${infoColor};
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
  border: 1px solid ${edgeColor};
  border-radius: 15%;
  padding: 4px;

  ${({ labelX, labelY }) => css`
    position: absolute;
    transform: translate(-50%, -50%) translate(${labelX}px, ${labelY}px);
  `}

  ${({ spotlight }) => {
    if (spotlight === "primary") {
      return css`
        border-color: ${highlightedEdgeColor};
        border-width: ${highlightedEdgeWidth};
        z-index: ${zIndex.primary};
      `;
    } else if (spotlight === "secondary") {
      return css`
        border-color: ${infoColor};
        border-width: ${highlightedEdgeWidth};
        z-index: ${zIndex.secondary};
      `;
    }
  }}
`;
