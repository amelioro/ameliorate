import lowerCase from "lodash/lowerCase";

import { errorWithData } from "../../../common/errorHandling";
import { Edge, Graph, findGraphPart, isNode } from "./graph";

// Using claimEdges instead of claimNodes because eventually we'll probably replace Root Claim nodes
// with direct edges from a claim to diagram part.
export const hasClaims = (edge: Edge, claimEdges: Edge[]) => {
  return claimEdges.some((claimEdge) => claimEdge.data.arguedDiagramPartId === edge.id);
};

export const getImplicitLabel = (arguedDiagramPartId: string, topicGraph: Graph): string => {
  const arguedDiagramPart = findGraphPart(arguedDiagramPartId, topicGraph.nodes, topicGraph.edges);
  if (isNode(arguedDiagramPart)) {
    return `"${arguedDiagramPart.data.label}" is important`;
  } else {
    const sourceNode = topicGraph.nodes.find((node) => node.id === arguedDiagramPart.source);
    const targetNode = topicGraph.nodes.find((node) => node.id === arguedDiagramPart.target);
    if (!sourceNode || !targetNode) {
      throw errorWithData("edge nodes not found", arguedDiagramPart, topicGraph);
    }

    return `"${targetNode.data.label}" ${lowerCase(arguedDiagramPart.label)} "${
      sourceNode.data.label
    }"`;
  }
};
