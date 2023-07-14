import styled from "@emotion/styled";
import { Drawer, IconButton, ListItemButton } from "@mui/material";

export const StyledListItemButton = styled(ListItemButton)`
  & span {
    margin: 0;
  }
`;

export const NestedListItemButton = styled(StyledListItemButton)`
  padding-left: 32px;
`;

export const PositionedDiv = styled.div`
  display: flex;
  position: absolute;
  height: 100%;
`;

export const TogglePaneButton = styled(IconButton)`
  position: absolute;
  right: 0;
  transform: translateX(100%);
  z-index: ${({ theme }) => theme.zIndex.appBar - 1};
`;

interface DrawerProps {
  open: boolean;
}

const width = "min(18.75rem, 100vw - 2rem)";
const options = {
  // `open` adds different transitions if passed to Material component
  shouldForwardProp: (prop: string) => !["open"].includes(prop),
};

// paper controls what the drawer actually looks like, but it's `position: fixed` so it
// doesn't affect surrounding elements.
// So there's a parent div non-fixed position in order to allow affecting surrounding elements (e.g. menu button),
// and this needs to match transition and size of Paper; this is why there's css on both elements.
export const StyledDrawer = styled(Drawer, options)<DrawerProps>`
  // paper uses 'transform' for transition by default, but I wasn't sure how to match that in the parent Drawer div,
  // so we're using 'width' for both instead, as done in https://mui.com/material-ui/react-drawer/#mini-variant-drawer
  width: ${({ open }) => (open ? width : "0")};
  transition: ${({ theme }) => theme.transitions.create(["width"])};
  white-space: nowrap; // prevent wrapping during drawer transition

  & .MuiDrawer-paper {
    z-index: ${({ theme }) => theme.zIndex.appBar - 1};
    width: ${({ open }) => (open ? width : "0")};
    transition: ${({ theme }) => theme.transitions.create(["width"])};
    overflow-x: hidden; // prevent scrollbar during drawer transition
    // allows the drawer to start at parent position, as opposed to MUI's default fixed positioning starting from top of page
    position: relative;
  }
`;
