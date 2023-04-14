import styled from "@emotion/styled";
import { TextareaAutosize } from "@mui/material";

export const nodeWidth = 300;
export const nodeHeight = 84;

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

export const IndicatorDiv = styled.div`
  display: flex;
`;

export const XEdgeDiv = styled.div`
  width: 24px;
`;

// allow handling mouse events for whole node without mouse icon changing to input for textarea
export const MiddleDiv = styled.div`
  display: flex;
  flex-grow: 1; // fill out remaining space with this div because it contains the textarea
  padding: 8px;
  margin-bottom: 8px;
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
  font-size: 20px;
  font-family: inherit;
`;

interface NodeDivProps {
  color: string;
}

const options = {
  shouldForwardProp: (prop: string) => !["color"].includes(prop),
};

/* some copied from https://github.com/wbkd/react-flow/blob/147656b22f577bb4141664d000e62ada9b490473/src/theme-default.css#L42-L77 */
export const NodeDiv = styled("div", options)<NodeDivProps>`
  width: ${nodeWidth}px;
  height: 100%; // allow expanding for use with table cells

  background: ${({ color }) => color};
  padding: 0px;
  display: flex;
  flex-direction: column;

  border-radius: 6px;
  border-width: 2px;
  border-style: solid;
  border-color: #1a192b;

  &:hover {
    box-shadow: 0 2px 8px 2px rgba(0, 0, 0, 0.08);
  }

  // TODO: make this work for table nodes as well; need to manage node.selected within EditableNode instead of letting reactflow handle it
  &.selected {
    box-shadow: 0 0 0 1px #1a192b;
  }
`;
