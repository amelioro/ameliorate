import { useEffect } from "react";

import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { deleteNode } from "@/web/topic/store/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { Node } from "@/web/topic/utils/graph";

export const DeleteNodeMenuItem = ({ node }: { node: Node }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  useEffect(() => {
    const handleGlobalDelete = (event: KeyboardEvent) => {
      if (event.key === "Delete" && userCanEditTopicData) {
        deleteNode(node.id);
      }
    };

    window.addEventListener("keydown", handleGlobalDelete);

    return () => {
      window.removeEventListener("keydown", handleGlobalDelete);
    };
  }, [node.id, userCanEditTopicData]);

  if (!userCanEditTopicData) return null;

  return <ContextMenuItem onClick={() => deleteNode(node.id)}>Delete Node</ContextMenuItem>;
};
