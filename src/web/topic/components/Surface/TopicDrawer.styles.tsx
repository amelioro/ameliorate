import styled from "@emotion/styled";
import { Drawer, IconButton, ListItemButton, css } from "@mui/material";

export const NestedListItemButton = styled(ListItemButton)`
  padding-left: 32px;
`;

export const PositionedDiv = styled.div`
  display: flex;
  position: relative;
`;

interface ButtonProps {
  isLandscape: boolean;
}

const buttonOptions = {
  shouldForwardProp: (prop: string) => !["isLandscape"].includes(prop),
};

export const ToggleDrawerButton = styled(IconButton, buttonOptions)<ButtonProps>`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndex.appBar - 1};

  ${({ isLandscape }) => {
    if (isLandscape) {
      return css`
        right: 0;
        transform: translateX(100%);
      `;
    } else {
      return css`
        right: 0;
        top: 0;
        transform: translateY(-100%);
      `;
    }
  }}
`;

interface DrawerProps {
  open: boolean;
  isLandscape: boolean;
}

const options = {
  // `open` adds different transitions if passed to Material component
  shouldForwardProp: (prop: string) => !["open", "isLandscape"].includes(prop),
};

// paper controls what the drawer actually looks like, but it's `position: fixed` so it
// doesn't affect surrounding elements.
// So there's a parent div non-fixed position in order to allow affecting surrounding elements (e.g. menu button),
// and this needs to match transition and size of Paper; this is why there's css on both elements.
export const StyledDrawer = styled(Drawer, options)<DrawerProps>`
  ${({ open, isLandscape }) => {
    const length = open ? `min(30${isLandscape ? "vw" : "vh"}, 18.75rem)` : "0";
    if (isLandscape) {
      return css`
        width: ${length};

        & .MuiDrawer-paper {
          width: ${length};
        }
      `;
    } else {
      return css`
        height: ${length};
        width: 100%;

        & .MuiDrawer-paper {
          height: ${length};
          width: 100%;
        }
      `;
    }
  }};

  // paper uses 'transform' for transition by default, but I wasn't sure how to match that in the parent Drawer div,
  // so we're using 'width' for both instead, as done in https://mui.com/material-ui/react-drawer/#mini-variant-drawer
  transition: ${({ theme }) => theme.transitions.create(["width", "height"])};
  white-space: nowrap; // prevent wrapping during drawer transition

  & .MuiDrawer-paper {
    z-index: ${({ theme }) => theme.zIndex.appBar - 1};
    transition: ${({ theme }) => theme.transitions.create(["width", "height"])};
    overflow-x: hidden; // prevent scrollbar during drawer transition
    // allows the drawer to start at parent position, as opposed to MUI's default fixed positioning starting from top of page
    position: relative;
  }
`;
