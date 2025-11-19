import { justificationRelationNames } from "@/common/edge";
import { isEdgeImplied } from "@/web/topic/utils/edge";
import { Edge, Graph, Node } from "@/web/topic/utils/graph";

export const hideImpliedEdges = (edges: Edge[], displayGraph: Graph, topicGraph: Graph) => {
  const justificationEdges = topicGraph.edges.filter((edge) =>
    justificationRelationNames.includes(edge.label),
  );

  return edges.filter((edge) => !isEdgeImplied(edge, displayGraph, justificationEdges));
};

export const hideProblemCriterionSolutionEdges = (nodes: Node[], edges: Edge[]) => {
  const problemIds = nodes.filter((node) => node.type === "problem").map((node) => node.id);
  const criterionIds = nodes.filter((node) => node.type === "criterion").map((node) => node.id);
  const solutionIds = nodes.filter((node) => node.type === "solution").map((node) => node.id);

  return edges.filter((edge) => {
    if (criterionIds.includes(edge.source) && problemIds.includes(edge.target)) return false;
    if (solutionIds.includes(edge.source) && criterionIds.includes(edge.target)) return false;
    if (solutionIds.includes(edge.source) && problemIds.includes(edge.target)) return false;

    return true;
  });
};
