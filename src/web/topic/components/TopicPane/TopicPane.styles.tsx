import styled from "@emotion/styled";
import { Drawer, IconButton, css } from "@mui/material";

import { nodeWidthRem } from "@/web/topic/components/Node/EditableNode.styles";

interface PositionProps {
  anchor: "left" | "right" | "bottom";
}
const positionOptions = {
  shouldForwardProp: (prop: string) => !["anchor"].includes(prop),
};
export const PositionedDiv = styled("div", positionOptions)<PositionProps>`
  height: 100%;
  display: flex;
  ${({ anchor }) => {
    if (anchor == "right") {
      return css`
        flex-direction: row-reverse;
      `;
    } else if (anchor == "bottom") {
      return css`
        flex-direction: column-reverse;
      `;
    }
  }}
`;

export const TogglePaneButton = styled(IconButton)`
  align-self: flex-start;
  z-index: ${({ theme }) => theme.zIndex.appBar - 1};
`;

interface DrawerProps {
  open: boolean;
  isLandscape: boolean;
}

const options = {
  // `open` adds different transitions if passed to Material component
  shouldForwardProp: (prop: string) => !["open", "isLandscape"].includes(prop),
};

const drawerPaddingRem = 0.5;
const drawerScrollbarWidthRem = 1; // make container big enough to hold both nodes even with scrollbar showing
const drawerMinWidthRem = nodeWidthRem * 2 + drawerPaddingRem + drawerScrollbarWidthRem;

// paper controls what the drawer actually looks like, but it's `position: fixed` so it
// doesn't affect surrounding elements.
// So there's a parent div non-fixed position in order to allow affecting surrounding elements (e.g. menu button),
// and this needs to match transition and size of Paper; this is why there's css on both elements.
export const StyledDrawer = styled(Drawer, options)<DrawerProps>`
  ${({ open, isLandscape }) => {
    const lengthIfOpen = isLandscape
      ? `${drawerMinWidthRem}rem`
      : `min(30vh, ${drawerMinWidthRem}rem)`;
    const length = open ? lengthIfOpen : "0";
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

  & .MuiTabPanel-root {
    // children should handle their own padding, the default here seems like too much
    padding: 0;
  }
`;
