import { Menu as MuiMenu } from "@mui/material";

import { closeContextMenu } from "../../store/contextMenuActions";
import { useAnchorPosition, useContextMenuContext } from "../../store/contextMenuStore";
import { AddNodeMenuItem } from "./AddNodeMenuItem";
import { AlsoShowNodeAndNeighborsMenuItem } from "./AlsoShowNodeAndNeighborsMenuItem";
import { ChangeEdgeTypeMenuItem } from "./ChangeEdgeTypeMenuItem";
import { ChangeNodeTypeMenuItem } from "./ChangeNodeTypeMenuItem";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";
import { DeleteEdgeMenuItem } from "./DeleteEdgeMenuItem";
import { DeleteNodeMenuItem } from "./DeleteNodeMenuItem";
import { HideMenuItem } from "./HideMenuItem";
import { OnlyShowNodeAndNeighborsMenuItem } from "./OnlyShowNodeAndNeighborsMenuItem";

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
