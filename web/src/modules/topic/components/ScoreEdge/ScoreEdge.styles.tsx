import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface PathProps {
  isImplied: boolean;
}

const pathOptions = {
  shouldForwardProp: (prop: string) => !["isImplied"].includes(prop),
};

export const StyledPath = styled("path", pathOptions)<PathProps>`
  ${({ isImplied }) => {
    if (isImplied) {
      return css`
        opacity: 0.5;
      `;
    }
  }}
`;

interface DivProps {
  labelX: number;
  labelY: number;
  isImplied: boolean;
}

const divOptions = {
  shouldForwardProp: (prop: string) => !["labelX", "labelY", "isImplied"].includes(prop),
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

  ${({ isImplied }) => {
    if (isImplied) {
      return css`
        opacity: 0.5;
        z-index: -1; // behind path svg which has z-index: 0
      `;
    }
  }}
`;
