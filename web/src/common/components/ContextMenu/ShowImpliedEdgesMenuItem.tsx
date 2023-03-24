import { getDiagram } from "../../../modules/topic/store/actions";
import { toggleShowEdges } from "../../../modules/topic/store/viewActions";
import { Node } from "../../../modules/topic/utils/diagram";
import { isEdgeAShortcut, isEdgeImpliedByComposition } from "../../../modules/topic/utils/edge";
import { edges } from "../../../modules/topic/utils/node";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const ShowImpliedEdgesMenuItem = ({ node }: { node: Node }) => {
  const diagram = getDiagram(node.data.diagramId);
  if (!diagram) throw new Error(`Diagram not found with id ${node.data.diagramId}`);

  const neighborEdges = edges(node, diagram);

  const impliedEdges = neighborEdges.filter(
    (edge) => isEdgeAShortcut(edge, diagram) || isEdgeImpliedByComposition(edge, diagram)
  );

  if (impliedEdges.length === 0) {
    return <></>;
  }

  // lean towards hiding if any are shown - opposite of the other show menu items because we consider
  // these edges to be more often unnecessary (and they will default to hidden)
  const someImpliedEdgesShown = impliedEdges.some((edge) => edge.data.showing);

  return (
    <CloseOnClickMenuItem
      onClick={() =>
        toggleShowEdges(
          impliedEdges.map((edge) => edge.id),
          !someImpliedEdgesShown
        )
      }
    >
      {someImpliedEdgesShown ? "Hide implied edges" : "Show implied edges"}
    </CloseOnClickMenuItem>
  );
};
