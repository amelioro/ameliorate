import { deleteEdge } from "../../../topic/store/createDeleteActions";
import { useUserCanEditTopicData } from "../../../topic/store/userHooks";
import { Edge, topicDiagramId } from "../../../topic/utils/diagram";
import { useSessionUser } from "../../hooks";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const DeleteEdgeMenuItem = ({ edge }: { edge: Edge }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  if (!userCanEditTopicData) return <></>;
  // doesn't make sense to delete claim edges because they're a tree not a graph - just delete the nodes
  if (edge.data.diagramId !== topicDiagramId) return <></>;

  return (
    <CloseOnClickMenuItem onClick={() => void deleteEdge(edge.id)}>
      Delete edge
    </CloseOnClickMenuItem>
  );
};
