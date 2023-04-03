import styled from "@emotion/styled";
import { css } from "@mui/material";

import { Node } from "../../utils/diagram";
import { Orientation } from "../../utils/layout";
import { zIndex } from "../Diagram/Diagram.styles";
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
    if (orientation === "TB") {
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
    if (orientation === "TB") {
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
  node: Node;
  isNeighborSelected: boolean;
  isEdgeSelected: boolean;
  isAnyArguableSelected: boolean;
}

const options = {
  shouldForwardProp: (prop: string) =>
    !["isNeighborSelected", "isEdgeSelected", "isAnyArguableSelected"].includes(prop),
};

export const StyledEditableNode = styled(EditableNode, options)<NodeProps>`
  ${({ theme, node, isNeighborSelected, isEdgeSelected, isAnyArguableSelected }) => {
    if (node.selected) {
      return css``;
    } else if (isNeighborSelected || isEdgeSelected) {
      return css`
        border-color: ${theme.palette.info.main};
        z-index: ${zIndex.arguableWhenNeighborSelected};
      `;
    } else if (isAnyArguableSelected) {
      return css`
        opacity: 0.5;
      `;
    }
  }};
`;

export const nodeStyles = (node: Node, isNeighborSelected: boolean) => {
  return css`
    // reactflow sets z-index on its node wrapper, so we can't just set z-index on our node div
    .react-flow__node[data-id="${node.id}"] {
      z-index: ${node.selected
        ? zIndex.arguableWhenSelected
        : isNeighborSelected
        ? zIndex.arguableWhenNeighborSelected
        : 0} !important; // !important to override because reactflow sets z-index via style attribute
    }
  `;
};
