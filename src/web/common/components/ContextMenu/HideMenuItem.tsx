import { Node } from "../../../topic/utils/graph";
import { hideNode } from "../../../view/navigateStore";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const HideMenuItem = ({ node }: { node: Node }) => {
  return <CloseOnClickMenuItem onClick={() => hideNode(node.id)}>Hide node</CloseOnClickMenuItem>;
};
