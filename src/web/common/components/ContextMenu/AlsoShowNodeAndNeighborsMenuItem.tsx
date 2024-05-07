import { Node } from "../../../topic/utils/graph";
import { showNodeAndNeighbors } from "../../../view/currentViewStore/store";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const AlsoShowNodeAndNeighborsMenuItem = ({ node }: { node: Node }) => {
  return (
    <CloseOnClickMenuItem onClick={() => showNodeAndNeighbors(node.id, true)}>
      Also show node and its neighbors
    </CloseOnClickMenuItem>
  );
};
