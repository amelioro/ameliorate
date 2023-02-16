import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { nodeWidth } from "../EditableNode/EditableNode.styles";

export const TitleDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px auto;
`;

export const tableStyles = (numberOfColumns: number) => css`
  // note: need two selectors to have higher precedence than MUI styles
  .criteria-table-paper {
    left: 50%;
    transform: translateX(-50%);
    position: relative;

    // Want to have table grow with columns, so we hardcode a total-width of table, but, if column widths
    // are hardcoded as well, doing so will create a horizontal scrollbar whenever too many rows results in a vertical scrollbar.
    // Therefore, the total-width will have a little extra space so that nodes are still >= min-width
    // if vertical scrollbar is visible.
    width: min(${nodeWidth * numberOfColumns + 20}px, 90%);

    .MuiTableContainer-root {
      // 96px is height of both toolbars
      // 100vh - 96px is the height of the index page space
      // wanting to take roughly 90% of that space, we'll multiply by 0.9
      // not sure how to do this directly based on parent height because the MUI table wraps this with a Paper container that is sized based on the table
      max-height: calc((100vh - 96px) * 0.9);
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
