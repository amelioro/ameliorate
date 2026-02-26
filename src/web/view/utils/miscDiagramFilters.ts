import { justificationRelationNames } from "@/common/edge";
import { isEdgeImplied } from "@/web/topic/utils/edge";
import { Edge, Graph, Node } from "@/web/topic/utils/graph";

export const hideImpliedEdges = (edges: Edge[], displayGraph: Graph, topicGraph: Graph) => {
  const justificationEdges = topicGraph.edges.filter((edge) =>
    justificationRelationNames.includes(edge.type),
  );

  return edges.filter((edge) => !isEdgeImplied(edge, displayGraph, justificationEdges));
};

export const hideProblemCriterionSolutionEdges = (nodes: Node[], edges: Edge[]) => {
  const problemIds = nodes.filter((node) => node.type === "problem").map((node) => node.id);
  const criterionIds = nodes.filter((node) => node.type === "criterion").map((node) => node.id);
  const solutionIds = nodes.filter((node) => node.type === "solution").map((node) => node.id);

  return edges.filter((edge) => {
    if (criterionIds.includes(edge.sourceId) && problemIds.includes(edge.targetId)) return false;
    if (solutionIds.includes(edge.sourceId) && criterionIds.includes(edge.targetId)) return false;
    if (solutionIds.includes(edge.sourceId) && problemIds.includes(edge.targetId)) return false;

    return true;
  });
};
