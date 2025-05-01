import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { deleteEdge } from "@/web/topic/store/createDeleteActions";
import { useIsTableEdge } from "@/web/topic/store/edgeHooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { Edge } from "@/web/topic/utils/graph";

export const DeleteEdgeMenuItem = ({ edge }: { edge: Edge }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const isTableEdge = useIsTableEdge(edge.id);

  if (!userCanEditTopicData) return <></>;
  // don't allow modifying edges that are part of the table, because they should always exist as long as their nodes do
  if (isTableEdge) return <></>;

  return <ContextMenuItem onClick={() => deleteEdge(edge.id)}>Delete edge</ContextMenuItem>;
};
