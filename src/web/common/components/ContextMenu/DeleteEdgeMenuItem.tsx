import { deleteEdge } from "../../../topic/store/createDeleteActions";
import { Edge, topicDiagramId } from "../../../topic/utils/diagram";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const DeleteEdgeMenuItem = ({ edge }: { edge: Edge }) => {
  // doesn't make sense to delete claim edges because they're a tree not a graph - just delete the nodes
  if (edge.data.diagramId !== topicDiagramId) return <></>;

  return (
    <CloseOnClickMenuItem onClick={() => void deleteEdge(edge.id)}>
      Delete edge
    </CloseOnClickMenuItem>
  );
};
