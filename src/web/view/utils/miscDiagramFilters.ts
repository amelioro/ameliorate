import { justificationRelationNames } from "@/common/edge";
import { isEdgeImplied } from "@/web/topic/utils/edge";
import { Edge, Graph } from "@/web/topic/utils/graph";

export const hideImpliedEdges = (edges: Edge[], displayGraph: Graph, topicGraph: Graph) => {
  const justificationEdges = topicGraph.edges.filter((edge) =>
    justificationRelationNames.includes(edge.label),
  );

  return edges.filter((edge) => !isEdgeImplied(edge, displayGraph, justificationEdges));
};
