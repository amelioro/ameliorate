import styled from "@emotion/styled";
import { TextareaAutosize, css } from "@mui/material";

import { Orientation } from "../../utils/layout";
import { NodeType } from "../../utils/nodes";
import { AddNodeButtonGroup } from "../AddNodeButtonGroup/AddNodeButtonGroup";

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

export const YEdgeDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 24px;
`;

export const NodeTypeDiv = styled.div`
  display: flex;
  padding: 4px;
`;

export const NodeTypeSpan = styled.span`
  font-size: 16px;
  line-height: 16px;
  padding-left: 4px;
`;

export const XEdgeDiv = styled.div`
  width: 24px;
`;

// allow handling mouse events for whole node without mouse icon changing to input for textarea
export const MiddleDiv = styled.div`
  display: flex;
  height: 100%;
  min-height: 38px; // without setting this, not sure how to get this to fill out to node's height, while allowing node's height to be stretched if more text is added
`;

interface StyledTextareaProps {
  color: string;
}

export const StyledTextareaAutosize = styled(TextareaAutosize)<StyledTextareaProps>`
  border: 0;
  resize: none;
  outline: none;
  text-align: center;
  align-self: center;
  background-color: ${({ color }) => color};
  width: 100%;
  font-size: 24px;
`;

export const nodeStyles = (width: number, color: string, nodeType: NodeType) => css`
  /* mostly copied from https://github.com/wbkd/react-flow/blob/147656b22f577bb4141664d000e62ada9b490473/src/theme-default.css#L42-L77 */
  .react-flow__node-${nodeType} {
    padding: 0px;
    border-radius: 6px;
    width: ${width}px;
    min-height: 90px;
    color: #222;
    text-align: center;
    border-width: 2px;
    border-style: solid;
    background: ${color};
    border-color: #1a192b;
    display: flex;
    flex-direction: column;

    &.selectable {
      &:hover {
        box-shadow: 0 2px 8px 2px rgba(0, 0, 0, 0.08);
      }

      &.selected {
        box-shadow: 0 0 0 1px #1a192b;
      }
    }

    .react-flow__handle {
      background: #1a192b;
    }
  }
`;
