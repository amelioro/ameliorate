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
  impliedEdge: -1,
  svgWhenAnyArguableSelected: 1,
  arguableWhenNeighborSelected: 2,
  arguableWhenSelected: 3,
};

interface FlowProps {
  isAnyArguableSelected: boolean;
}

const flowOptions = {
  shouldForwardProp: (prop: string) => !["isAnyArguableSelected"].includes(prop),
};

export const StyledReactFlow = styled(ReactFlow, flowOptions)<FlowProps>`
  display: flex;
  justify-content: center;
  align-items: center;

  // maintain some visual context when overlaying diagrams
  background-color: rgba(255, 255, 255, 0.87);

  ${({ isAnyArguableSelected }) => {
    if (isAnyArguableSelected) {
      return css`
        & svg.react-flow__edges {
          z-index: ${zIndex.svgWhenAnyArguableSelected} !important; // z-index on this is set via library's inline style, so need to use !important to override
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
