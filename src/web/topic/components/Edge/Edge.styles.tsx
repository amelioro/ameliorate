import { css } from "@emotion/react";
import styled from "@emotion/styled";

import {
  Spotlight,
  primarySpotlightColor,
  secondarySpotlightColor,
  zIndex,
} from "@/web/topic/components/Diagram/Diagram.styles";

const highlightedEdgeWidth = "2px";
export const edgeColor = "#b1b1b7"; // react flow default

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
          stroke: ${primarySpotlightColor} !important;
          stroke-width: ${highlightedEdgeWidth};
        `;
      } else if (spotlight === "secondary") {
        return css`
          stroke: ${secondarySpotlightColor};
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
  border: 1px solid ${edgeColor};

  ${({ labelX, labelY }) => css`
    position: absolute;
    transform: translate(-50%, -50%) translate(${labelX}px, ${labelY}px);
  `}

  ${({ spotlight }) => {
    if (spotlight === "primary") {
      return css`
        border-color: ${primarySpotlightColor};
        border-width: ${highlightedEdgeWidth};
        z-index: ${zIndex.primary};
      `;
    } else if (spotlight === "secondary") {
      return css`
        border-color: ${secondarySpotlightColor};
        border-width: ${highlightedEdgeWidth};
        z-index: ${zIndex.secondary};
      `;
    }
  }}
`;
