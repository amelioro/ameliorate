import { deleteNode } from "../../../topic/store/createDeleteActions";
import { useUserCanEditTopicData } from "../../../topic/store/userHooks";
import { Node } from "../../../topic/utils/diagram";
import { useSessionUser } from "../../hooks";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const DeleteNodeMenuItem = ({ node }: { node: Node }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  if (!userCanEditTopicData) return <></>;

  return (
    <CloseOnClickMenuItem onClick={() => deleteNode(node.id)}>Delete node</CloseOnClickMenuItem>
  );
};
