import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Handle } from "reactflow";

interface Props {
  hasHiddenComponents: boolean;
}

const options = {
  shouldForwardProp: (prop: string) => !["hasHiddenComponents"].includes(prop),
};

export const StyledHandle = styled(Handle, options)<Props>`
  // two selectors to override react-flow's styles
  &.react-flow__handle {
    width: 10px;
    height: 10px;

    ${({ theme, hasHiddenComponents }) => {
      if (hasHiddenComponents) {
        return css`
          background-color: ${theme.palette.info.main};
        `;
      }
    }}
  }
`;
