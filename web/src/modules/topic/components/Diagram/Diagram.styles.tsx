import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import { ReactFlow } from "reactflow";
import "reactflow/dist/style.css";

export const StyledReactFlow = styled(ReactFlow)`
  display: "flex";
  justify-content: "center";
  align-items: "center";
  z-index: 1; // behind close button
`;

export const PositionedIconButton = styled(IconButton)`
  position: absolute;
  z-index: 2;
  right: 0;
`;
