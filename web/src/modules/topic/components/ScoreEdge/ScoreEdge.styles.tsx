import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { zIndex } from "../Diagram/Diagram.styles";

interface PathProps {
  isEdgeSelected: boolean;
  isNodeSelected: boolean;
  isAnyArguableSelected: boolean;
  isImplied: boolean;
}

const pathOptions = {
  shouldForwardProp: (prop: string) =>
    !["isEdgeSelected", "isNodeSelected", "isAnyArguableSelected", "isImplied"].includes(prop),
};

export const StyledPath = styled("path", pathOptions)<PathProps>`
  &.react-flow__edge-path {
    ${({ theme, isEdgeSelected, isNodeSelected, isAnyArguableSelected, isImplied }) => {
      if (isEdgeSelected) {
        return css`
          opacity: 1;
        `;
      } else if (isNodeSelected) {
        return css`
          // marker should be styled too but reactflow's default only styles this, and that's probably
          // because marker styles need to be specified when creating the marker element, without css
          stroke: ${theme.palette.info.main};
        `;
      } else if (isAnyArguableSelected) {
        return css`
          opacity: 0.5;
        `;
      } else if (isImplied) {
        return css`
          opacity: 0.5;
        `;
      }
    }}
  }
`;

interface DivProps {
  labelX: number;
  labelY: number;
  isEdgeSelected: boolean;
  isNodeSelected: boolean;
  isAnyArguableSelected: boolean;
  isImplied: boolean;
}

const divOptions = {
  shouldForwardProp: (prop: string) =>
    ![
      "labelX",
      "labelY",
      "isEdgeSelected",
      "isNodeSelected",
      "isAnyArguableSelected",
      "isImplied",
    ].includes(prop),
};

export const StyledDiv = styled("div", divOptions)<DivProps>`
  pointer-events: all;
  cursor: pointer;

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

  ${({ theme, isEdgeSelected, isNodeSelected, isAnyArguableSelected, isImplied }) => {
    if (isEdgeSelected) {
      return css`
        border-color: #555;
        z-index: ${zIndex.arguableWhenSelected};
      `;
    } else if (isNodeSelected) {
      return css`
        border-color: ${theme.palette.info.main};
        z-index: ${zIndex.arguableWhenNeighborSelected};
      `;
    } else if (isAnyArguableSelected) {
      return css`
        opacity: 0.5;
      `;
    } else if (isImplied) {
      return css`
        opacity: 0.5;
        z-index: ${zIndex.impliedEdge};
      `;
    }
  }}
`;
