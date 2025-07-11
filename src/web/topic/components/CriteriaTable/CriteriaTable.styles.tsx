import { css } from "@emotion/react";

// values set by mui and material-react-table
const iconHeight = "1.5rem";
const iconPadding = "16px";
const toolbarPadding = "1rem";
const toolbarMinimumHeight = "3.5rem";

export const tableStyles = css`
  // note: need two selectors to have higher precedence than MUI styles
  .criteria-table-paper {
    height: 100%;
    width: 100%;

    .MuiTableContainer-root {
      max-height: min(
        100% - ${iconHeight} - ${iconPadding} - ${toolbarPadding},
        100% - ${toolbarMinimumHeight}
      );
      /* MUI-Paper is not sized dynamically with the total table. 
        Because of this; directly applying the box shadow from MUI-paper onto table */
      box-shadow:
        0px 3px 1px -2px rgba(0, 0, 0, 0.2),
        0px 2px 2px 0px rgba(0, 0, 0, 0.14),
        0px 1px 5px 0px rgba(0, 0, 0, 0.12);
    }

    table {
      height: 1px; // hack to allow cell heights to expand to row height https://stackoverflow.com/a/46110096

      th {
        font-weight: inherit; // don't bold header text because we're just using our node component that should handle looking how it wants
      }

      .MuiTableCell-root {
        padding: 0;
        border-right: 1px solid #ddd; // honestly not sure where this color comes from, but it matches the MUI table row border

        overflow: visible; // not sure why hidden by default, but we want to allow node toolbars to show beyond the cell bounds
        position: static; // not sure why relative by default, but we want to allow node toolbars to z-index above nodes in other cells
      }

      .Mui-TableHeadCell-Content,
      .Mui-TableHeadCell-Content-Labels,
      .Mui-TableHeadCell-Content-Wrapper {
        // also pretty troll, to allow head cells to expand to row height and col width - non-head cells don't have wrappers like these so don't need this
        height: 100%;
        width: 100%;

        overflow: visible; // not sure why hidden by default, but we want to allow node toolbars to show beyond the cell bounds
      }

      .Mui-TableHeadCell-Content-Labels > span {
        display: none; // hide filter icon because it displays awkwardly outside of node in cell
      }
    }
  }
`;
