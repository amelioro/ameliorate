import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Handle } from "reactflow";

import { Spotlight } from "../Diagram/Diagram.styles";

interface Props {
  hasHiddenComponents: boolean;
  spotlight: Spotlight;
}

const options = {
  shouldForwardProp: (prop: string) => !["hasHiddenComponents", "spotlight"].includes(prop),
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

    ${({ spotlight }) => {
      if (spotlight === "background") {
        return css`
          opacity: 0.5;
        `;
      }
    }}
  }
`;
