import { Menu as MuiMenu } from "@mui/material";

import { AddNodeMenuItem } from "@/web/common/components/ContextMenu/AddNodeMenuItem";
import { AlsoShowNodeAndNeighborsMenuItem } from "@/web/common/components/ContextMenu/AlsoShowNodeAndNeighborsMenuItem";
import { ChangeEdgeTypeMenuItem } from "@/web/common/components/ContextMenu/ChangeEdgeTypeMenuItem";
import { ChangeNodeTypeMenuItem } from "@/web/common/components/ContextMenu/ChangeNodeTypeMenuItem";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { DeleteEdgeMenuItem } from "@/web/common/components/ContextMenu/DeleteEdgeMenuItem";
import { DeleteNodeMenuItem } from "@/web/common/components/ContextMenu/DeleteNodeMenuItem";
import { HideMenuItem } from "@/web/common/components/ContextMenu/HideMenuItem";
import { OnlyShowNodeAndNeighborsMenuItem } from "@/web/common/components/ContextMenu/OnlyShowNodeAndNeighborsMenuItem";
import { ViewContextInDiagramMenuItem } from "@/web/common/components/ContextMenu/ViewContextInDiagramMenuItem";
import { ViewDetailsMenuItem } from "@/web/common/components/ContextMenu/ViewDetailsMenuItem";
import { ViewTableMenuItem } from "@/web/common/components/ContextMenu/ViewTableMenuItem";
import { closeContextMenu } from "@/web/common/store/contextMenuActions";
import { useAnchorPosition, useContextMenuContext } from "@/web/common/store/contextMenuStore";

export const ContextMenu = () => {
  const anchorPosition = useAnchorPosition();
  const contextMenuContext = useContextMenuContext();

  if (contextMenuContext === undefined) return <></>;

  const isOpen = Boolean(anchorPosition);

  const contextNode = contextMenuContext.node;
  const contextEdge = contextMenuContext.edge;
  const contextPart = contextNode ?? contextEdge;

  // create these based on what's set in the context
  const menuItems = [
    // view actions (so that this functionality is still available if indicators are hidden)
    contextPart && <ViewDetailsMenuItem graphPart={contextPart} key={1} />,
    contextNode?.type === "problem" && <ViewTableMenuItem node={contextNode} key={2} />,
    contextPart && <ViewContextInDiagramMenuItem graphPart={contextPart} key={3} />,

    // CRUD actions
    contextPart === undefined && <AddNodeMenuItem parentMenuOpen={isOpen} key={9} />,
    contextNode && <ChangeNodeTypeMenuItem node={contextNode} parentMenuOpen={isOpen} key={7} />,
    contextEdge && <ChangeEdgeTypeMenuItem edge={contextEdge} parentMenuOpen={isOpen} key={8} />,
    contextNode && <DeleteNodeMenuItem node={contextNode} key={5} />,
    contextEdge && <DeleteEdgeMenuItem edge={contextEdge} key={6} />,

    // show/hide actions
    contextNode && <AlsoShowNodeAndNeighborsMenuItem node={contextNode} key={11} />,
    contextNode && <OnlyShowNodeAndNeighborsMenuItem node={contextNode} key={12} />,
    contextNode && <HideMenuItem node={contextNode} key={13} />,

    // ensure there's never an empty context menu; that shows an empty bubble and feels awkward
    <ContextMenuItem key={10}>Cancel</ContextMenuItem>,
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
