import { css } from "@emotion/react";

const tableToolbarHeightPx = "56px";

export const tableStyles = css`
  // note: need two selectors to have higher precedence than MUI styles
  .criteria-table-paper {
    height: calc(100% - ${tableToolbarHeightPx});
    .MuiTableContainer-root {
      max-height: 100%;
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
        // also pretty troll, to allow head cells to expand to row height and col width - non-head cells don't have wrappers like these so don't need this
        height: 100%;
        width: 100%;
      }
    }
  }
`;
