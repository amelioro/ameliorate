import styled from "@emotion/styled";
import { Button } from "@mui/material";

export const StyledDiv = styled.div`
  display: flex;
  position: relative;
  margin: 1px;
`;

interface StyledButtonProps {
  buttonLength: number;
}

// seems like MUI automatically forwards invalid props to underlying HTML components?
// this seems wrong, or at least that it shouldn't be the default
const options = {
  shouldForwardProp: (prop: string) => !["buttonLength"].includes(prop),
};
const StyledButton = styled(Button, options)<StyledButtonProps>`
  height: ${({ buttonLength }) => `${buttonLength}px`};
  width: ${({ buttonLength }) => `${buttonLength}px`};
  min-width: ${({ buttonLength }) => `${buttonLength}px`};
  line-height: 8px;
  font-size: 8px;
  padding: 0px;
  border-radius: 50%;
`;

export const MainButton = styled(StyledButton)`
  z-index: 2; // in front of floating buttons (to avoid hover interference during transition)
`;

interface FloatingButtonProps {
  position: {
    x: number;
    y: number;
  };
  buttonLength: number; // just forwarded
}

export const FloatingButton = styled(StyledButton)<FloatingButtonProps>`
  position: absolute;
  visibility: hidden; // visibility works with transitions, display does not
  transition: all 0.5s; // would be nice to make this zoom rather than expand, not sure how to do that though (briefly looked at MUI's Zoom component)
  z-index: 1;

  ${StyledDiv}:hover & {
    visibility: visible;
    transform: ${({ position }) => `translate(${position.x}px, ${position.y}px)`};
  }
`;

interface FloatingDivProps {
  radius: number;
  buttonLength: number;
}

// keep floating buttons displayed while hovering within this
export const FloatingDiv = styled.div<FloatingDivProps>`
  position: absolute;
  width: ${({ radius, buttonLength }) => `${radius * 2 + buttonLength}px`};
  height: ${({ radius, buttonLength }) => `${radius * 2 + buttonLength}px`};
  transform: ${({ buttonLength }) =>
    // center around MainButton, then shift by half floating button width because lowest button is positioned from its top
    `translate(-50%, -50%) translate(${buttonLength / 2}px, ${buttonLength / 2}px)`};
  border-radius: 50%;
  display: none;
  z-index: 0; // render behind buttons

  ${StyledDiv}:hover & {
    display: inherit;
  }
`;
