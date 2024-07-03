import styled from "@emotion/styled";
import { Drawer, IconButton, css } from "@mui/material";

import { nodeWidthRem } from "@/web/topic/components/Node/EditableNode.styles";

export type Anchor = "top" | "left" | "bottom" | "right";
export const PositionedDiv = styled.div`
  position: relative;
`;

interface ButtonProps {
  anchor: Anchor;
}

const buttonOptions = {
  shouldForwardProp: (prop: string) => !["anchor"].includes(prop),
};

export const TogglePaneButton = styled(IconButton, buttonOptions)<ButtonProps>`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndex.appBar - 1};

  ${({ anchor }) => {
    switch (anchor) {
      case "left":
        return css`
          right: 0;
          transform: translateX(100%);
        `;
      case "right":
        return css`
          left: 0;
          transform: translateX(-100%);
        `;
      default:
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
  anchor: Anchor;
}

const options = {
  // `open` adds different transitions if passed to Material component
  shouldForwardProp: (prop: string) => !["open"].includes(prop),
};

const drawerPaddingRem = 0.5;
const drawerScrollbarWidthRem = 1; // make container big enough to hold both nodes even with scrollbar showing
const drawerMinWidthRem = nodeWidthRem * 2 + drawerPaddingRem + drawerScrollbarWidthRem;

// paper controls what the drawer actually looks like, but it's `position: fixed` so it
// doesn't affect surrounding elements.
// So there's a parent div non-fixed position in order to allow affecting surrounding elements (e.g. menu button),
// and this needs to match transition and size of Paper; this is why there's css on both elements.
export const StyledDrawer = styled(Drawer, options)<DrawerProps>`
  ${({ open, anchor }) => {
    const isLandscape = anchor !== "bottom";
    const lengthIfOpen = isLandscape
      ? `${drawerMinWidthRem}rem`
      : `min(30vh, ${drawerMinWidthRem}rem)`;
    const length = open ? lengthIfOpen : "0";
    const width = isLandscape ? length : "100%";
    const height = isLandscape ? "100%" : length;
    const borderStyle = open ? "" : "border: none;"; // drawer is given a 1px border which takes up more space than the 0 width

    return css`
      width: ${width};
      height: ${height};

      & .MuiDrawer-paper {
        width: ${width};
        height: ${height};
        ${borderStyle};
      }
    `;
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
