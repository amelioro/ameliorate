import styled from "@emotion/styled";
import { Popper, css } from "@mui/material";

export const ScorePopper = styled(Popper)`
  display: flex;
  position: absolute;
  border-radius: 50%;
  ${({ theme }) => css`
    z-index: ${theme.zIndex.tooltip};
  `}
`;

export const BackdropPopper = styled(Popper)`
  // jank to override Popper behavior to work like a Modal;
  // using a Modal would be cleaner but more effort to switch to that now.
  inset: 0 !important;
  position: fixed !important;
  transform: none !important;

  ${({ theme }) => css`
    z-index: ${theme.zIndex.tooltip};
  `}
`;

interface CircleProps {
  circleDiameter: number;
}

const circleOptions = {
  shouldForwardProp: (prop: string) => !["circleDiameter"].includes(prop),
};

export const CircleDiv = styled("div", circleOptions)<CircleProps>`
  /* Center content based on parent center*/
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  border-radius: 50%;
  overflow: hidden;

  height: ${({ circleDiameter }) => `${circleDiameter}rem`};
  width: ${({ circleDiameter }) => `${circleDiameter}rem`};
`;
