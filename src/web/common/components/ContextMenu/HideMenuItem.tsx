import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { Node } from "@/web/topic/utils/graph";
import { hideNode } from "@/web/view/currentViewStore/filter";

export const HideMenuItem = ({ node }: { node: Node }) => {
  return <CloseOnClickMenuItem onClick={() => hideNode(node.id)}>Hide node</CloseOnClickMenuItem>;
};
