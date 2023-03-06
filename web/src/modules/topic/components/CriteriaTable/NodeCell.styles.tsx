import styled from "@emotion/styled";

import { nodeWidth } from "../Node/EditableNode.styles";

export const StyledDiv = styled.div`
  height: 100%; // expand to fill cell in case other cells are bigger due to nodes having more rows of text

  // Stretchable cell size because MUI tables seem to require sizing based on container size,
  // and don't allow sizing based on cell content sizes.
  // Therefore, width will be kind-of fixed by being based on the table's hardcoded width.
  // We still keep a min-width to prevent node components from conflicting with each other.
  min-width: ${nodeWidth}px;

  & > div {
    width: auto; // override EditableNode's width to allow stretching
  }
`;
