import styled from "@emotion/styled";
import { Slider } from "@mui/material";

export const ScoreSpan = styled.span`
  font-size: 8px;
  line-height: 8px;
  padding: 2px;
`;

export const StyledSlider = styled(Slider)`
  position: absolute;
  bottom: 90%;
  left: 46.8%;
  display: none;

  span:hover > &,
  &.MuiSlider-dragging {
    display: inherit;
  }
`;
