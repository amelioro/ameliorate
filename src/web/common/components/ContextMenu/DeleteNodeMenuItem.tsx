import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { deleteNode } from "@/web/topic/diagramStore/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/diagramStore/userHooks";
import { Node } from "@/web/topic/utils/graph";

export const DeleteNodeMenuItem = ({ node }: { node: Node }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  if (!userCanEditTopicData) return <></>;

  return <ContextMenuItem onClick={() => deleteNode(node.id)}>Delete node</ContextMenuItem>;
};
