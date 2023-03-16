import { MenuItem, Menu as MuiMenu } from "@mui/material";

import { deleteNode } from "../../../modules/topic/store/actions";
import { closeContextMenu } from "../../store/contextMenuActions";
import { useAnchorPosition, useContextMenuContext } from "../../store/contextMenuStore";
import { addCloseOnClick } from "../Menu/Menu";

export const ContextMenu = () => {
  const anchorPosition = useAnchorPosition();
  const contextMenuContext = useContextMenuContext();

  if (contextMenuContext === undefined) return <></>;

  const isOpen = Boolean(anchorPosition);

  // create these based on what's set in the context
  const menuItems = (
    <MenuItem
      onClick={() => {
        deleteNode(contextMenuContext.node.id);
      }}
    >
      Delete node
    </MenuItem>
  );

  const menuItemsWithCloseOnClick = addCloseOnClick(closeContextMenu, menuItems);

  return (
    <MuiMenu
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={isOpen}
      onClose={closeContextMenu}
    >
      {menuItemsWithCloseOnClick}
    </MuiMenu>
  );
};
