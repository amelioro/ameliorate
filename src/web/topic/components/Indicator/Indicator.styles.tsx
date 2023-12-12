import styled from "@emotion/styled";
import { Button } from "@mui/material";

import { indicatorLengthRem } from "../../utils/node";

export const StyledButton = styled(Button)`
  width: ${indicatorLengthRem}rem;
  min-width: ${indicatorLengthRem}rem;
  height: ${indicatorLengthRem}rem;
  padding: 0px;
`;
