import styled from "@emotion/styled";

interface DivProps {
  length: number;
}

export const StyledDiv = styled.div<DivProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ length }) => `${length}px`};
  height: ${({ length }) => `${length}px`};
`;
