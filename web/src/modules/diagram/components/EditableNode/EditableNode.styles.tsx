import styled from "@emotion/styled";
import { TextareaAutosize, css } from "@mui/material";

import { AddNodeButtonGroup } from "../AddNodeButtonGroup/AddNodeButtonGroup";

const StyledAddNodeButtonGroup = styled(AddNodeButtonGroup)`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: none;

  .react-flow__node:hover > &,
  .react-flow__node.selected > & {
    display: inherit;
  }
`;

export const AddNodeButtonGroupParent = styled(StyledAddNodeButtonGroup)`
  top: -30px;
`;

export const AddNodeButtonGroupChild = styled(StyledAddNodeButtonGroup)`
  bottom: -30px;
`;

// allow handling mouse events for whole node without mouse icon changing to input for textarea
export const Div = styled.div`
  display: flex;
  padding: 10px;
`;

export const StyledTextareaAutosize = styled(TextareaAutosize)`
  width: 100%;
  border: 0;
  resize: none;
  outline: none;
  text-align: center;
`;

export const nodeStyles = (width: number) => css`
  /* copied from https://github.com/wbkd/react-flow/blob/147656b22f577bb4141664d000e62ada9b490473/src/theme-default.css#L42-L77 */
  .react-flow__node-editable {
    padding: 0px;
    border-radius: 3px;
    width: ${width}px;
    font-size: 12px;
    color: #222;
    text-align: center;
    border-width: 1px;
    border-style: solid;
    background: #fff;
    border-color: #1a192b;
    display: flex;

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
