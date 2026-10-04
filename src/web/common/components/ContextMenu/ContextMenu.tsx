import { Menu as MuiMenu, useMediaQuery, useTheme } from "@mui/material";

import { ContextMenuItems } from "@/web/common/components/ContextMenu/ContextMenuItems";
import { MobileMenuDrawer } from "@/web/common/components/Menu/MobileMenuDrawer";
import { closeContextMenu } from "@/web/common/store/contextMenuActions";
import {
  type Context,
  useAnchorPosition,
  useContextMenuContext,
} from "@/web/common/store/contextMenuStore";

const getMobileTitle = (context: Context | undefined) => {
  if (context?.node) return "Node Actions";
  if (context?.edge ?? context?.calculatedEdge) return "Edge Actions";
  return "Diagram Actions";
};

export const ContextMenu = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const anchorPosition = useAnchorPosition();
  const contextMenuContext = useContextMenuContext();

  const isOpen = Boolean(anchorPosition);

  // context is only undefined before the menu has been opened for the first time
  const menuItems = contextMenuContext && (
    <ContextMenuItems
      node={contextMenuContext.node}
      edge={contextMenuContext.edge}
      calculatedEdge={contextMenuContext.calculatedEdge}
      isOpen={isOpen}
    />
  );

  // Menus are always rendered (even before there's a context) so that they can animate open/closed;
  // e.g. MUI's Drawer skips its open animation if it's mounted with `open` already true.

  // flyout submenus are awkward on small screens, so use a drawer with drill-down submenus instead
  if (isMobile) {
    return (
      <MobileMenuDrawer
        open={isOpen}
        onClose={closeContextMenu}
        title={getMobileTitle(contextMenuContext)}
      >
        {menuItems}
      </MobileMenuDrawer>
    );
  }

  return (
    <MuiMenu
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={isOpen}
      onClose={closeContextMenu}
      onContextMenu={(e) => e.preventDefault()}
      slotProps={{
        // prevent actions while animating closed, e.g. so that double-clicking "delete" doesn't try to delete twice
        paper: { className: isOpen ? undefined : "pointer-events-none" },
      }}
    >
      {menuItems}
    </MuiMenu>
  );
};
