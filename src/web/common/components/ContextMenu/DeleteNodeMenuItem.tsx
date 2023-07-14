import { deleteNode } from "../../../topic/store/createDeleteActions";
import { Node } from "../../../topic/utils/diagram";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const DeleteNodeMenuItem = ({ node }: { node: Node }) => {
  return (
    <CloseOnClickMenuItem onClick={() => void deleteNode(node.id)}>
      Delete node
    </CloseOnClickMenuItem>
  );
};
