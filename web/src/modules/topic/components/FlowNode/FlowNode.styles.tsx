import styled from "@emotion/styled";
import { css } from "@mui/material";

import { Orientation } from "../../utils/layout";
import { NodeType } from "../../utils/nodes";
import { AddNodeButtonGroup } from "../AddNodeButtonGroup/AddNodeButtonGroup";
import { nodeWidth } from "../EditableNode/EditableNode.styles";

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
    display: inherit;
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

export const nodeStyles = (width: number, color: string, nodeType: NodeType) => css`
  .react-flow__node-${nodeType} {
    width: ${nodeWidth}px;

    .react-flow__handle {
      background: #1a192b;
    }
  }
`;
