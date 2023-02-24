import styled from "@emotion/styled";
import { css } from "@mui/material";

import { Orientation } from "../../utils/layout";
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
