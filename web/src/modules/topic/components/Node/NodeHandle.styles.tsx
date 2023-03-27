import styled from "@emotion/styled";
import { Handle } from "reactflow";

export const StyledHandle = styled(Handle)`
  // two selectors to override react-flow's styles
  &.react-flow__handle {
    width: 10px;
    height: 10px;
  }
`;
