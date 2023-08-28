import styled from "@emotion/styled";
import { Button, Popper, css } from "@mui/material";

interface StyledButtonProps {
  buttonLength: number;
  zoomRatio?: number;
}

// seems like MUI automatically forwards invalid props to underlying HTML components?
// this seems wrong, or at least that it shouldn't be the default
const buttonOptions = {
  shouldForwardProp: (prop: string) => !["buttonLength", "zoomRatio"].includes(prop),
};
export const StyledButton = styled(Button, buttonOptions)<StyledButtonProps>`
  height: ${({ buttonLength }) => `${buttonLength}rem`};
  width: ${({ buttonLength }) => `${buttonLength}rem`};
  min-width: ${({ buttonLength }) => `${buttonLength}rem`};
  line-height: ${({ zoomRatio = 1 }) => `${zoomRatio}rem`};
  font-size: ${({ zoomRatio = 1 }) => `${zoomRatio}rem`};
  padding: 0px;
  border-radius: 50%;
`;

export const ScorePopper = styled(Popper)`
  display: flex;
  position: absolute;
  border-radius: 50%;
  ${({ theme }) =>
    css`
      z-index: ${theme.zIndex.tooltip};
    `}
`;

interface BackdropProps {
  isPieSelected: boolean;
}

const backdropOptions = {
  shouldForwardProp: (props: string) => !["isPieSelected"].includes(props),
};

export const BackdropPopper = styled(Popper, backdropOptions)<BackdropProps>`
  // jank to override Popper behavior to work like a Modal;
  // using a Modal would be cleaner but more effort to switch to that now.
  inset: 0 !important;
  position: fixed !important;
  transform: none !important;

  ${({ theme }) => css`
    z-index: ${theme.zIndex.tooltip};
  `}
  ${({ isPieSelected }) => {
    if (isPieSelected)
      return css`
        background: black;
        opacity: 0.5;
      `;
  }}
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
