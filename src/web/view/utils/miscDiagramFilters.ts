import { type MinimalEdge } from "@/common/edge";
import { justificationRelationNames } from "@/common/edge";
import { type MinimalGraph } from "@/common/graph";
import { type MinimalNode } from "@/common/node";
import { isEdgeImplied } from "@/web/topic/utils/edge";
import { type Edge } from "@/web/topic/utils/graph";

export const hideImpliedEdges = <TEdge extends MinimalEdge>(
  edges: TEdge[],
  displayGraph: MinimalGraph,
  topicGraph: { nodes: MinimalNode[]; edges: Edge[] },
) => {
  const justificationEdges = topicGraph.edges.filter((edge) =>
    justificationRelationNames.includes(edge.type),
  );

  return edges.filter((edge) => !isEdgeImplied(edge, displayGraph, justificationEdges));
};

export const hideProblemCriterionSolutionEdges = <TEdge extends MinimalEdge>(
  nodes: MinimalNode[],
  edges: TEdge[],
) => {
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
