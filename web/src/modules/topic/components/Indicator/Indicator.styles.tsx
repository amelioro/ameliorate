import styled from "@emotion/styled";
import { Button } from "@mui/material";

import { indicatorLength } from "../../utils/node";

export const StyledButton = styled(Button)`
  width: ${indicatorLength}px;
  min-width: ${indicatorLength}px;
  height: ${indicatorLength}px;
  margin-right: 2px;
  padding: 0px;

  &:hover > svg {
    color: ${({ theme }) => theme.palette.neutral.dark};
  }
`;
