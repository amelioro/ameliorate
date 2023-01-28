import styled from "@emotion/styled";
import { Button } from "@mui/material";

import { indicatorLength } from "../../utils/nodes";

export const StyledButton = styled(Button)`
  width: ${indicatorLength}px;
  min-width: ${indicatorLength}px;
  height: ${indicatorLength}px;
  margin-top: 2px;
  padding: 0px;
`;
