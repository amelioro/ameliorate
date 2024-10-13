import styled from "@emotion/styled";
import { Box, TextareaAutosize } from "@mui/material";

import { htmlDefaultFontSize } from "@/pages/_document.page";
import { ContentIndicators } from "@/web/topic/components/Indicator/ContentIndicators";
import { StatusIndicators } from "@/web/topic/components/Indicator/StatusIndicators";

export const nodeWidthRem = 11;

export const nodeWidthPx = nodeWidthRem * htmlDefaultFontSize;
export const nodeHeightPx = 66;

export const YEdgeBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const NodeTypeBox = styled(Box)`
  display: flex;
  height: 24px;
  align-items: center;
`;

export const NodeTypeSpan = styled.span`
  font-size: 0.875rem;
  line-height: 1;
  padding-right: 4px;
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
  padding: 4px 4px 8px;
`;

export const StyledTextareaAutosize = styled(TextareaAutosize)`
  padding: 0;
  border: 0;
  resize: none;
  outline: none;
  text-align: center;
  align-self: center;
  background-color: transparent;
  width: 100%;
  font-size: 1rem;
  line-height: 1;
  font-family: inherit;

  // so that readonly textarea doesn't appear gray
  color: ${({ theme }) => theme.palette.text.primary};

  &[readonly] {
    // So that the cursor doesn't imply that textarea is editable.
    // Previously had "pointer-events: none" to also prevent clicking from selecting text before
    // node becomes editable, but this also prevents scrolling, which is not desirable, so that was removed.
    cursor: default;
  }
`;

/* some copied from https://github.com/wbkd/react-flow/blob/147656b22f577bb4141664d000e62ada9b490473/src/theme-default.css#L42-L77 */
export const NodeBox = styled(Box)`
  width: ${nodeWidthRem}rem;

  padding: 0px;
  display: flex;
  flex-direction: column;

  border-radius: 6px;
  border-width: 2px;
  border-style: solid;

  // react-flow sets this to pan hand because nodes can't be moved, so dragging a node will pan, but
  // we want to indicate that the node is selectable.
  cursor: default;

  // avoid inheriting because flow node will wrap in a motion.div that ignores pointer events
  pointer-events: auto;

  &:hover {
    box-shadow: 0 2px 8px 2px rgba(0, 0, 0, 0.08);
  }

  // TODO: make this work for table nodes as well; need to manage node.selected within EditableNode instead of letting reactflow handle it
  &.selected {
    border-color: black;
    box-shadow: 0 0 0 1px black;
  }
`;

export const RightCornerContentIndicators = styled(ContentIndicators)`
  position: absolute;
  right: 0;
  bottom: 0;
  // amount that looks decent hanging over the edge of node
  transform: translate(10px, 65%);
`;

export const LeftCornerStatusIndicators = styled(StatusIndicators)`
  position: absolute;
  left: 0;
  bottom: 0;
  // amount that looks decent hanging over the edge of node
  transform: translate(-10px, 65%);
`;
