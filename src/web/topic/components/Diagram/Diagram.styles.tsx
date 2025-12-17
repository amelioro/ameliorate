import styled from "@emotion/styled";
import { ReactFlow } from "@xyflow/react";

import { infoColor } from "@/web/common/theme";

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

export const primarySpotlightColor = infoColor;
export const secondarySpotlightColor = "#6b7280"; // text-gray-500, darker than react flow edge default

export const StyledReactFlow = styled(ReactFlow)`
  display: flex;
  justify-content: center;
  align-items: center;

  // Very fragile "z-index:" selector because there's no other differentiation between the
  // svg for elevated edges and the svg for not-elevated edges.
  // We don't want to rely on the lib's 1000 because that pulls edges in front of primary and
  // secondary graph parts (because we're handling z-index manually, I think because the lib
  // doesn't elevate node neighbors when a node is selected?).
  // (Doubly fragile separate attr selectors because reactflow sets "z-index: " with a space, but
  // emotion removes the space from the attr selector when compiling).
  .react-flow__edges > svg[style*="z-index:"][style*="1000"] {
    z-index: ${zIndex.svgWhenAnyGraphPartSelected} !important; // z-index on this is set via library's inline style, so need to use !important to override
  }
`;
