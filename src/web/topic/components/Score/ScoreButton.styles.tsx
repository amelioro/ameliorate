import styled from "@emotion/styled";
import { Button, css } from "@mui/material";

interface StyledButtonProps {
  buttonDiameter: number;
  zoomRatio?: number;
}

// seems like MUI automatically forwards invalid props to underlying HTML components?
// this seems wrong, or at least that it shouldn't be the default
const buttonOptions = {
  shouldForwardProp: (prop: string) => !["buttonDiameter", "zoomRatio"].includes(prop),
};
export const StyledButton = styled(Button, buttonOptions)<StyledButtonProps>`
  ${({ buttonDiameter, zoomRatio = 1 }) => {
    return css`
      height: ${buttonDiameter * zoomRatio}rem;
      width: ${buttonDiameter * zoomRatio}rem;
      min-width: ${buttonDiameter * zoomRatio}rem;
      line-height: ${zoomRatio}rem;
      font-size: ${zoomRatio}rem;
    `;
  }}

  padding: 0px;
`;
