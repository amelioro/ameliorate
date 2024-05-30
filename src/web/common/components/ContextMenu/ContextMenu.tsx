import { Menu as MuiMenu } from "@mui/material";

import { AddNodeMenuItem } from "@/web/common/components/ContextMenu/AddNodeMenuItem";
import { AlsoShowNodeAndNeighborsMenuItem } from "@/web/common/components/ContextMenu/AlsoShowNodeAndNeighborsMenuItem";
import { ChangeEdgeTypeMenuItem } from "@/web/common/components/ContextMenu/ChangeEdgeTypeMenuItem";
import { ChangeNodeTypeMenuItem } from "@/web/common/components/ContextMenu/ChangeNodeTypeMenuItem";
import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { DeleteEdgeMenuItem } from "@/web/common/components/ContextMenu/DeleteEdgeMenuItem";
import { DeleteNodeMenuItem } from "@/web/common/components/ContextMenu/DeleteNodeMenuItem";
import { HideMenuItem } from "@/web/common/components/ContextMenu/HideMenuItem";
import { OnlyShowNodeAndNeighborsMenuItem } from "@/web/common/components/ContextMenu/OnlyShowNodeAndNeighborsMenuItem";
import { closeContextMenu } from "@/web/common/store/contextMenuActions";
import { useAnchorPosition, useContextMenuContext } from "@/web/common/store/contextMenuStore";

export const ContextMenu = () => {
  const anchorPosition = useAnchorPosition();
  const contextMenuContext = useContextMenuContext();

  if (contextMenuContext === undefined) return <></>;

  const isOpen = Boolean(anchorPosition);

  // create these based on what's set in the context
  const menuItems = [
    !contextMenuContext.node && !contextMenuContext.edge && (
      <AddNodeMenuItem parentMenuOpen={isOpen} key={9} />
    ),
    contextMenuContext.node && (
      <ChangeNodeTypeMenuItem node={contextMenuContext.node} parentMenuOpen={isOpen} key={7} />
    ),
    contextMenuContext.edge && (
      <ChangeEdgeTypeMenuItem edge={contextMenuContext.edge} parentMenuOpen={isOpen} key={8} />
    ),
    contextMenuContext.node && (
      <AlsoShowNodeAndNeighborsMenuItem node={contextMenuContext.node} key={11} />
    ),
    contextMenuContext.node && (
      <OnlyShowNodeAndNeighborsMenuItem node={contextMenuContext.node} key={12} />
    ),
    contextMenuContext.node && <HideMenuItem node={contextMenuContext.node} key={13} />,
    contextMenuContext.node && <DeleteNodeMenuItem node={contextMenuContext.node} key={5} />,
    contextMenuContext.edge && <DeleteEdgeMenuItem edge={contextMenuContext.edge} key={6} />,

    // ensure there's never an empty context menu; that shows an empty bubble and feels awkward
    <CloseOnClickMenuItem key={10}>Cancel</CloseOnClickMenuItem>,
  ].filter((item): item is JSX.Element => !!item);

  return (
    <MuiMenu
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={isOpen}
      onClose={closeContextMenu}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menuItems}
    </MuiMenu>
  );
};
