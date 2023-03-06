import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface DivProps {
  labelX: number;
  labelY: number;
}

export const StyledDiv = styled.div<DivProps>`
  ${({ labelX, labelY }) => css`
    position: absolute;
    transform: translate(-50%, -50%) translate(${labelX}px, ${labelY}px);

    pointer-events: all;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    background-color: white;
    border: 1px solid #b1b1b7; // match edge stroke color that comes from react-flow default css
    border-radius: 15%;
    padding: 4px;
  `}
`;
