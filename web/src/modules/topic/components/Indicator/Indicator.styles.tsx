import styled from "@emotion/styled";
import { Button } from "@mui/material";

import { indicatorLength } from "../../utils/node";

export const StyledButton = styled(Button)`
  width: ${indicatorLength}rem;
  min-width: ${indicatorLength}rem;
  height: ${indicatorLength}rem;
  margin-right: 2px;
  padding: 0px;

  &:hover > svg {
    color: ${({ theme }) => theme.palette.neutral.dark};
  }
`;
