import { AddNodeMenuItem } from "@/web/common/components/ContextMenu/AddNodeMenuItem";
import { AlsoShowNodeAndNeighborsMenuItem } from "@/web/common/components/ContextMenu/AlsoShowNodeAndNeighborsMenuItem";
import { ChangeEdgeTypeMenuItem } from "@/web/common/components/ContextMenu/ChangeEdgeTypeMenuItem";
import { ChangeNodeTypeMenuItem } from "@/web/common/components/ContextMenu/ChangeNodeTypeMenuItem";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { CopyLinkToPartMenuItem } from "@/web/common/components/ContextMenu/CopyLinkToPart";
import { DeleteEdgeMenuItem } from "@/web/common/components/ContextMenu/DeleteEdgeMenuItem";
import { DeleteNodeMenuItem } from "@/web/common/components/ContextMenu/DeleteNodeMenuItem";
import { HideMenuItem } from "@/web/common/components/ContextMenu/HideMenuItem";
import { OnlyShowNodeAndNeighborsMenuItem } from "@/web/common/components/ContextMenu/OnlyShowNodeAndNeighborsMenuItem";
import { ViewContextInDiagramMenuItem } from "@/web/common/components/ContextMenu/ViewContextInDiagramMenuItem";
import { ViewDetailsMenuItem } from "@/web/common/components/ContextMenu/ViewDetailsMenuItem";
import { ViewTableMenuItem } from "@/web/common/components/ContextMenu/ViewTableMenuItem";
import { Context } from "@/web/common/store/contextMenuStore";

/**
 * Extracted to a separate component so that we can reuse for both the regular context menu and for
 * the node's more menu.
 */
export const ContextMenuItems = ({
  node: contextNode,
  edge: contextEdge,
  isOpen,
}: Context & { isOpen: boolean }) => {
  const contextPart = contextNode ?? contextEdge;

  return (
    <>
      {/* view actions (so that this functionality is still available if indicators are hidden) */}
      {contextPart && <ViewDetailsMenuItem graphPart={contextPart} />}
      {contextNode?.type === "problem" && <ViewTableMenuItem node={contextNode} />}
      {contextPart && <ViewContextInDiagramMenuItem graphPart={contextPart} />}

      {/* CRUD actions */}
      {contextPart === undefined && <AddNodeMenuItem parentMenuOpen={isOpen} />}
      {contextNode && <ChangeNodeTypeMenuItem node={contextNode} parentMenuOpen={isOpen} />}
      {contextEdge && <ChangeEdgeTypeMenuItem edge={contextEdge} parentMenuOpen={isOpen} />}
      {contextNode && <DeleteNodeMenuItem node={contextNode} />}
      {contextEdge && <DeleteEdgeMenuItem edge={contextEdge} />}

      {/* show/hide actions */}
      {contextNode && <AlsoShowNodeAndNeighborsMenuItem node={contextNode} />}
      {contextNode && <OnlyShowNodeAndNeighborsMenuItem node={contextNode} />}
      {contextNode && <HideMenuItem node={contextNode} />}

      {/* misc? actions */}
      {contextPart && <CopyLinkToPartMenuItem graphPart={contextPart} />}

      {/* ensure there's never an empty context menu; that shows an empty bubble and feels awkward */}
      <ContextMenuItem>Cancel</ContextMenuItem>
    </>
  );
};
