import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { Node } from "@/web/topic/utils/graph";
import { showNodeAndNeighbors } from "@/web/view/currentViewStore/filter";

export const OnlyShowNodeAndNeighborsMenuItem = ({ node }: { node: Node }) => {
  return (
    <ContextMenuItem onClick={() => showNodeAndNeighbors(node.id, false)}>
      Only show node and its neighbors
    </ContextMenuItem>
  );
};
