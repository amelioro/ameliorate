import { Menu as MuiMenu } from "@mui/material";

import { closeContextMenu } from "../../store/contextMenuActions";
import { useAnchorPosition, useContextMenuContext } from "../../store/contextMenuStore";
import { DeleteNodeMenuItem } from "./DeleteNodeMenuItem";
import { ShowCriteriaMenuItem } from "./ShowCriteriaMenuItem";

export const ContextMenu = () => {
  const anchorPosition = useAnchorPosition();
  const contextMenuContext = useContextMenuContext();

  if (contextMenuContext === undefined) return <></>;

  const isOpen = Boolean(anchorPosition);

  // create these based on what's set in the context
  const menuItems = (
    <>
      <ShowCriteriaMenuItem node={contextMenuContext.node} />
      <DeleteNodeMenuItem node={contextMenuContext.node} />
    </>
  );

  return (
    <MuiMenu
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={isOpen}
      onClose={closeContextMenu}
    >
      {menuItems}
    </MuiMenu>
  );
};
