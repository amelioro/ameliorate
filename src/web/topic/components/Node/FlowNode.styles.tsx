import styled from "@emotion/styled";
import { css } from "@mui/material";

import {
  Spotlight,
  secondarySpotlightColor,
  zIndex,
} from "@/web/topic/components/Diagram/Diagram.styles";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { Node } from "@/web/topic/utils/graph";

const nodeBridgeGap = 16;

// enables ability to use hover to add a node by bridging the gap between the node and the add buttons
export const HoverBridgeDiv = styled.div`
  position: absolute;
  height: calc(100% + ${2 * nodeBridgeGap}px);
  width: calc(100% + ${2 * nodeBridgeGap}px);
  transform: translateX(-${nodeBridgeGap}px) translateY(-${nodeBridgeGap}px);
  z-index: -1; // behind node
  display: none;

  .react-flow__node:hover > & {
    display: inherit;
  }
`;

export const StyledEditableNode = styled(EditableNode)`
  &.spotlight-secondary {
    border-color: ${secondarySpotlightColor};
    z-index: ${zIndex.secondary};
  }

  .react-flow.flashlight-mode & {
    cursor: copy; // TODO?: use a flashlight for the cursor
  }
`;

export const nodeStyles = (node: Node, spotlight: Spotlight) => {
  return css`
    // reactflow sets z-index on its node wrapper, so we can't just set z-index on our node div
    .react-flow__node[data-id="${node.id}"] {
      z-index: ${spotlight === "primary"
        ? zIndex.primary
        : spotlight === "secondary"
          ? zIndex.secondary
          : 0} !important; // !important to override because reactflow sets z-index via style attribute
    }

    .react-flow__node[data-id="${node.id}"]:hover {
      // ensure hovered node and its e.g. toolbar can be in front of other nodes
      z-index: ${zIndex.primary + 1} !important;
    }
  `;
};
