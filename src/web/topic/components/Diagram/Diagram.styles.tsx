import styled from "@emotion/styled";
import { IconButton, css } from "@mui/material";
import { ReactFlow } from "reactflow";
import "reactflow/dist/style.css";

/**
 * default render order:
 * edge svg (z-index: 0);
 * edge labels (z-index: auto);
 * nodes (z-index: 0);
 */
export const zIndex = {
  background: -1,
  svgWhenAnyGraphPartSelected: 1,
  secondary: 2,
  primary: 3,
};

export type Spotlight = "primary" | "secondary" | "normal" | "background";

interface FlowProps {
  isAnyGraphPartSelected: boolean;
}

const flowOptions = {
  shouldForwardProp: (prop: string) => !["isAnyGraphPartSelected"].includes(prop),
};

export const StyledReactFlow = styled(ReactFlow, flowOptions)<FlowProps>`
  display: flex;
  justify-content: center;
  align-items: center;

  // maintain some visual context when overlaying diagrams
  background-color: rgba(255, 255, 255, 0.87);

  ${({ isAnyGraphPartSelected }) => {
    if (isAnyGraphPartSelected) {
      return css`
        // Very fragile "z-index: " selector because there's no other differentiation between the
        // svg for elevated edges and the svg for not-elevated edges.
        // We don't want to rely on the lib's 1000 because that pulls edges in front of primary and
        // secondary graph parts (because we're handling z-index manually, I think because the lib
        // doesn't elevate node neighbors when a node is selected?).
        & svg.react-flow__edges[style*="z-index: 1000"] {
          z-index: ${zIndex.svgWhenAnyGraphPartSelected} !important; // z-index on this is set via library's inline style, so need to use !important to override
        }
      `;
    }
  }};
`;

export const PositionedCloseButton = styled(IconButton)`
  position: absolute;
  z-index: 1;
  right: 0;
`;
