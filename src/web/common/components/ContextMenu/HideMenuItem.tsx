import { Node } from "../../../topic/utils/graph";
import { hideNode } from "../../../view/currentViewStore/store";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const HideMenuItem = ({ node }: { node: Node }) => {
  return <CloseOnClickMenuItem onClick={() => hideNode(node.id)}>Hide node</CloseOnClickMenuItem>;
};
