import styled from "@emotion/styled";
import { Button, Popper, css } from "@mui/material";

interface StyledButtonProps {
  buttonLength: number;
}

// seems like MUI automatically forwards invalid props to underlying HTML components?
// this seems wrong, or at least that it shouldn't be the default
const options = {
  shouldForwardProp: (prop: string) => !["buttonLength"].includes(prop),
};
export const StyledButton = styled(Button, options)<StyledButtonProps>`
  height: ${({ buttonLength }) => `${buttonLength}px`};
  width: ${({ buttonLength }) => `${buttonLength}px`};
  min-width: ${({ buttonLength }) => `${buttonLength}px`};
  line-height: 16px;
  font-size: 16px;
  padding: 0px;
  border-radius: 50%;
`;

export const StyledPopper = styled(Popper)`
  ${({ theme }) => css`
    z-index: ${theme.zIndex.tooltip}; // even in front of toolbars
  `}
`;
