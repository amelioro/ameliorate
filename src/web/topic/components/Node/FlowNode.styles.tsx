import styled from "@emotion/styled";
import { css } from "@mui/material";

import { Node } from "../../utils/graph";
import { Orientation } from "../../utils/layout";
import { Spotlight, zIndex } from "../Diagram/Diagram.styles";
import { AddNodeButtonGroup } from "../Node/AddNodeButtonGroup";
import { EditableNode } from "./EditableNode";

const gap = 16;

// enables ability to use hover to add a node by bridging the gap between the node and the add buttons
export const HoverBridgeDiv = styled.div`
  position: absolute;
  height: calc(100% + ${2 * gap}px);
  width: calc(100% + ${2 * gap}px);
  transform: translateX(-${gap}px) translateY(-${gap}px);
  z-index: -1; // behind node
  display: none;

  .react-flow__node:hover > & {
    display: inherit;
  }
`;

const StyledAddNodeButtonGroup = styled(AddNodeButtonGroup)`
  position: absolute;
  display: none;

  .react-flow__node:hover > &,
  .react-flow__node.selected > & {
    display: flex;
  }
`;

export const AddNodeButtonGroupParent = styled(StyledAddNodeButtonGroup)<{
  orientation: Orientation;
}>`
  ${({ orientation }) => {
    if (orientation === "DOWN") {
      return css`
        left: 50%;
        top: 0;
        transform: translateX(-50%) translateY(-100%) translateY(-${gap}px);
      `;
    } else {
      return css`
        top: 50%;
        left: 0;
        transform: translateY(-50%) translateX(-100%) translateX(-${gap}px);
      `;
    }
  }}
`;

export const AddNodeButtonGroupChild = styled(StyledAddNodeButtonGroup)<{
  orientation: Orientation;
}>`
  ${({ orientation }) => {
    if (orientation === "DOWN") {
      return css`
        left: 50%;
        bottom: 0;
        transform: translateX(-50%) translateY(100%) translateY(${gap}px);
      `;
    } else {
      return css`
        top: 50%;
        right: 0;
        transform: translateY(-50%) translateX(100%) translateX(${gap}px);
      `;
    }
  }}
`;

interface NodeProps {
  spotlight: Spotlight;
}

const options = {
  shouldForwardProp: (prop: string) => !["spotlight"].includes(prop),
};

export const StyledEditableNode = styled(EditableNode, options)<NodeProps>`
  ${({ theme, spotlight }) => {
    if (spotlight === "primary") {
      return css``;
    } else if (spotlight === "secondary") {
      return css`
        border-color: ${theme.palette.info.main};
        z-index: ${zIndex.secondary};
      `;
    }
  }};
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
  `;
};
