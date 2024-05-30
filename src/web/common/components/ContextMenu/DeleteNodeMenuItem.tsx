import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { deleteNode } from "@/web/topic/store/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { Node } from "@/web/topic/utils/graph";

export const DeleteNodeMenuItem = ({ node }: { node: Node }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  if (!userCanEditTopicData) return <></>;

  return (
    <CloseOnClickMenuItem onClick={() => deleteNode(node.id)}>Delete node</CloseOnClickMenuItem>
  );
};
