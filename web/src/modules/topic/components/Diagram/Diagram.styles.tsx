import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import { ReactFlow } from "reactflow";
import "reactflow/dist/style.css";

export const StyledReactFlow = styled(ReactFlow)`
  display: "flex";
  justify-content: "center";
  align-items: "center";
`;

export const PositionedCloseButton = styled(IconButton)`
  position: absolute;
  z-index: 1;
  right: 0;
`;
