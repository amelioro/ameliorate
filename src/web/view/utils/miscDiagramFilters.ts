import { MinimalCalculatedEdge, type MinimalEdge } from "@/common/edge";
import { justificationRelationNames } from "@/common/edge";
import { type MinimalGraph } from "@/common/graph";
import { type MinimalNode } from "@/common/node";
import { isEdgeImplied } from "@/web/topic/utils/edge";
import { type Edge } from "@/web/topic/utils/graph";
import { isIndirectEdge } from "@/web/topic/utils/indirectEdges";

export const hideImpliedEdges = <TEdge extends MinimalEdge | MinimalCalculatedEdge>(
  edges: TEdge[],
  displayGraph: MinimalGraph,
  topicGraph: { nodes: MinimalNode[]; edges: Edge[] },
) => {
  const justificationEdges = topicGraph.edges.filter((edge) =>
    justificationRelationNames.includes(edge.type),
  );

  return edges.filter(
    // Indirect edges can't be implied; only direct (persisted) edges can be.
    // Not sure how to get `isIndirectEdge` to type-narrow away from `MinimalEdge` so that we don't
    // need `as`. seems ok to cast for now. if there are many places we do this, then we maybe could
    // consider adding `isMinimalEdge` or something.
    (edge) =>
      isIndirectEdge(edge) || !isEdgeImplied(edge as MinimalEdge, displayGraph, justificationEdges),
  );
};

export const hideProblemCriterionSolutionEdges = <
  TEdge extends MinimalEdge | MinimalCalculatedEdge,
>(
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
