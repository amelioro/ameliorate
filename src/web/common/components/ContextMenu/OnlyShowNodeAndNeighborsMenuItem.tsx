import { Node } from "../../../topic/utils/graph";
import { showNodeAndNeighbors } from "../../../view/currentViewStore/store";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const OnlyShowNodeAndNeighborsMenuItem = ({ node }: { node: Node }) => {
  return (
    <CloseOnClickMenuItem onClick={() => showNodeAndNeighbors(node.id, false)}>
      Only show node and its neighbors
    </CloseOnClickMenuItem>
  );
};
