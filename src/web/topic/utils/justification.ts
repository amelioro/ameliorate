import { lowerCase } from "es-toolkit";

import { justificationRelationNames } from "@/common/edge";
import { errorWithData } from "@/common/errorHandling";
import { Edge, Graph, GraphPart, findGraphPartOrThrow, isNode } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

// Using justificationEdges instead of justificationNodes because eventually we'll probably replace Root Claim nodes
// with direct edges from a justification to diagram part.
export const hasJustification = (edge: Edge, justificationEdges: Edge[]) => {
  return justificationEdges.some(
    (justificationEdge) => justificationEdge.data.arguedDiagramPartId === edge.id,
  );
};

export const getImplicitLabel = (arguedDiagramPartId: string, topicGraph: Graph): string => {
  const arguedDiagramPart = findGraphPartOrThrow(
    arguedDiagramPartId,
    topicGraph.nodes,
    topicGraph.edges,
  );
  if (isNode(arguedDiagramPart)) {
    return `"${arguedDiagramPart.data.label}" is an important ${nodeDecorations[arguedDiagramPart.type].title} in this topic`;
  } else {
    const sourceNode = topicGraph.nodes.find((node) => node.id === arguedDiagramPart.source);
    const targetNode = topicGraph.nodes.find((node) => node.id === arguedDiagramPart.target);
    if (!sourceNode || !targetNode) {
      throw errorWithData("edge nodes not found", arguedDiagramPart, topicGraph);
    }

    return (
      `${nodeDecorations[targetNode.type].title} "${targetNode.data.label}" ` +
      lowerCase(arguedDiagramPart.label) +
      ` ${nodeDecorations[sourceNode.type].title} "${sourceNode.data.label}"`
    );
  }
};

export const isJustificationEdge = (graphPart: GraphPart) => {
  return !isNode(graphPart) && justificationRelationNames.includes(graphPart.label);
};
