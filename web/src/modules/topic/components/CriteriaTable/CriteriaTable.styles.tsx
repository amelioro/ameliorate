import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, IconButton } from "@mui/material";

import { AddNodeButton } from "../Node/AddNodeButton";
import { nodeWidth } from "../Node/EditableNode.styles";

export const TitleDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px auto;
`;

export const tableStyles = css`
  // note: need two selectors to have higher precedence than MUI styles
  .criteria-table-paper {
    .MuiTableContainer-root {
      // 96px is height of both toolbars
      // 100vh - 96px is the height of the index page space
      // - (32px + 84px) is roughly the height that the problem title takes up
      // wanting to take roughly 85% of that space, we'll multiply by 0.85
      // not sure how to do this directly based on parent height because the MUI table wraps this with a Paper container that is sized based on the table
      max-height: calc((100vh - 96px - 32px - 84px) * 0.85);
    }

    table {
      height: 1px; // hack to allow cell heights to expand to row height https://stackoverflow.com/a/46110096

      th {
        font-weight: inherit; // don't bold header text because we're just using our node component that should handle looking how it wants
      }

      .MuiTableCell-root {
        padding: 0;
        border-right: 1px solid #ddd; // honestly not sure where this color comes from, but it matches the MUI table row border
      }

      .Mui-TableHeadCell-Content,
      .Mui-TableHeadCell-Content-Labels,
      .Mui-TableHeadCell-Content-Wrapper {
        height: 100%; // also pretty troll, to allow head cell heights to expand to row height - non-head cells don't have wrappers like these so don't need this
      }
    }
  }
`;

export const PositionedCloseButton = styled(IconButton)`
  position: absolute;
  z-index: 1;
  right: 0;
`;

interface TableDivProps {
  numberOfColumns: number;
}

const tableDivOptions = {
  shouldForwardProp: (prop: string) => !["numberOfColumns"].includes(prop),
};

export const TableDiv = styled("div", tableDivOptions)<TableDivProps>`
  left: 50%;
  transform: translateX(-50%);
  position: relative;
  ${({ numberOfColumns }) => {
    return css`
      // Want to have table grow with columns, so we hardcode a total-width of table, but, if column widths
      // are hardcoded as well, doing so will create a horizontal scrollbar whenever too many rows results in a vertical scrollbar.
      // Therefore, the total-width will have a little extra space so that nodes are still >= min-width
      // if vertical scrollbar is visible.
      width: min(${nodeWidth * numberOfColumns + 20}px, 80%);
    `;
  }}
`;

interface AddNodeButtonProps {
  position: "column" | "row";
}

const options = {
  shouldForwardProp: (prop: string) => !["position"].includes(prop),
};

export const PositionedAddNodeButton = styled(AddNodeButton, options)<AddNodeButtonProps>`
  position: absolute;
  ${({ position }) => {
    if (position === "column") {
      return css`
        bottom: 0;
        left: 0;
        transform: translate(0, 150%);
      `;
    } else {
      return css`
        right: 0;
        top: 0;
        transform: translate(150%, 0);
      `;
    }
  }}
`;

export const StyledTransposeTableButton = styled(Button)`
  position: absolute;
  top: 0;
  left: 0;
`;
