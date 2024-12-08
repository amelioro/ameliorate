import styled from "@emotion/styled";
import { Box, TextareaAutosize } from "@mui/material";

import { htmlDefaultFontSize } from "@/pages/_document.page";
import { ContentIndicators } from "@/web/topic/components/Indicator/ContentIndicators";
import { StatusIndicators } from "@/web/topic/components/Indicator/StatusIndicators";

export const nodeWidthRem = 11;
const nodeHeightRem = 3.5625; // 1 line of text results in 57px height, / 16px = 3.5625rem

export const nodeWidthPx = nodeWidthRem * htmlDefaultFontSize;
export const nodeHeightPx = nodeHeightRem * htmlDefaultFontSize;

export const TopDiv = styled.div``;
export const NodeTypeDiv = styled.div``;

export const NodeTypeSpan = styled.span``;

export const IndicatorDiv = styled.div`
  display: flex;
`;

// allow handling mouse events for whole node without mouse icon changing to input for textarea
export const MiddleDiv = styled.div``;
export const BottomDiv = styled.div``;

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
  transform: translate(0.625rem, 65%);
`;

export const LeftCornerStatusIndicators = styled(StatusIndicators)`
  position: absolute;
  left: 0;
  bottom: 0;
  // amount that looks decent hanging over the edge of node
  transform: translate(-0.625px, 65%);
`;
