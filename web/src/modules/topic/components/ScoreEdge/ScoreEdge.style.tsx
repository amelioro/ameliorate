import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface DivProps {
  length: number;
  labelX: number;
  labelY: number;
}

export const StyledDiv = styled.div<DivProps>`
  ${({ length, labelX, labelY }) => css`
    position: absolute;
    transform: translate(-50%, -50%) translate(${labelX}px, ${labelY}px);

    pointer-events: all;

    display: flex;
    justify-content: center;
    align-items: center;

    width: ${length}px;
    height: ${length}px;
  `}
`;
