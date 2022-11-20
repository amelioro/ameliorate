import styled from "@emotion/styled";
import { TextareaAutosize, css } from "@mui/material";

import { Direction } from "../../utils/layout";
import { AddNodeButtonGroup } from "../AddNodeButtonGroup/AddNodeButtonGroup";

const StyledAddNodeButtonGroup = styled(AddNodeButtonGroup)`
  position: absolute;
  display: none;

  .react-flow__node:hover > &,
  .react-flow__node.selected > & {
    display: inherit;
  }
`;

const gap = "10px";
const options = {
  shouldForwardProp: (prop: string) => !["direction"].includes(prop),
};

export const AddNodeButtonGroupParent = styled(StyledAddNodeButtonGroup, options)<{
  direction: Direction;
}>`
  ${({ direction }) => {
    if (direction === "TB") {
      return css`
        left: 50%;
        top: 0;
        transform: translateX(-50%) translateY(-100%) translateY(-${gap});
      `;
    } else {
      return css`
        top: 50%;
        left: 0;
        transform: translateY(-50%) translateX(-100%) translateX(-${gap});
      `;
    }
  }}
`;

export const AddNodeButtonGroupChild = styled(StyledAddNodeButtonGroup, options)<{
  direction: Direction;
}>`
  ${({ direction }) => {
    if (direction === "TB") {
      return css`
        left: 50%;
        bottom: 0;
        transform: translateX(-50%) translateY(100%) translateY(${gap});
      `;
    } else {
      return css`
        top: 50%;
        right: 0;
        transform: translateY(-50%) translateX(100%) translateX(${gap});
      `;
    }
  }}
`;

export const YEdgeDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 12px;
`;

export const NodeTypeDiv = styled.div`
  display: flex;
  padding: 2px;
`;

export const NodeTypeSpan = styled.span`
  font-size: 8px;
  line-height: 8px;
  padding-left: 2px;
`;

export const XEdgeDiv = styled.div`
  width: 12px;
`;

// allow handling mouse events for whole node without mouse icon changing to input for textarea
export const MiddleDiv = styled.div`
  display: flex;
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
`;

export const nodeStyles = (width: number, color: string, type: string) => css`
  /* mostly copied from https://github.com/wbkd/react-flow/blob/147656b22f577bb4141664d000e62ada9b490473/src/theme-default.css#L42-L77 */
  .react-flow__node-${type} {
    padding: 0px;
    border-radius: 3px;
    width: ${width}px;
    font-size: 12px;
    color: #222;
    text-align: center;
    border-width: 1px;
    border-style: solid;
    background: ${color};
    border-color: #1a192b;
    display: flex;
    flex-direction: column;

    &.selectable {
      &:hover {
        box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.08);
      }

      &.selected {
        box-shadow: 0 0 0 0.5px #1a192b;
      }
    }

    .react-flow__handle {
      background: #1a192b;
    }
  }
`;
