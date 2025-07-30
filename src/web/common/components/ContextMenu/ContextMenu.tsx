import { Menu as MuiMenu } from "@mui/material";

import { ContextMenuItems } from "@/web/common/components/ContextMenu/ContextMenuItems";
import { closeContextMenu } from "@/web/common/store/contextMenuActions";
import { useAnchorPosition, useContextMenuContext } from "@/web/common/store/contextMenuStore";

export const ContextMenu = () => {
  const anchorPosition = useAnchorPosition();
  const contextMenuContext = useContextMenuContext();

  if (contextMenuContext === undefined) return <></>;

  const isOpen = Boolean(anchorPosition);

  return (
    <MuiMenu
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={isOpen}
      onClose={closeContextMenu}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ContextMenuItems
        node={contextMenuContext.node}
        edge={contextMenuContext.edge}
        isOpen={isOpen}
      />
    </MuiMenu>
  );
};
