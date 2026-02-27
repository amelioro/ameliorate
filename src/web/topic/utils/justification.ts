import { lowerCase } from "es-toolkit";

import { type MinimalEdge } from "@/common/edge";
import { justificationRelationNames } from "@/common/edge";
import { errorWithData } from "@/common/errorHandling";
import { prettyNodeTypes } from "@/common/node";
import { Edge, Graph, GraphPart, findGraphPartOrThrow, isNode } from "@/web/topic/utils/graph";

// Using justificationEdges instead of justificationNodes because eventually we'll probably replace Root Claim nodes
// with direct edges from a justification to diagram part.
export const hasJustification = (edge: MinimalEdge, justificationEdges: Edge[]) => {
  return justificationEdges.some(
    (justificationEdge) => justificationEdge.data.arguedDiagramPartId === edge.id,
  );
};

export const getImplicitText = (arguedDiagramPartId: string, topicGraph: Graph): string => {
  const arguedDiagramPart = findGraphPartOrThrow(
    arguedDiagramPartId,
    topicGraph.nodes,
    topicGraph.edges,
  );
  if (isNode(arguedDiagramPart)) {
    return `"${arguedDiagramPart.data.text}" is an important ${prettyNodeTypes[arguedDiagramPart.type]} in this topic`;
  } else {
    const sourceNode = topicGraph.nodes.find((node) => node.id === arguedDiagramPart.sourceId);
    const targetNode = topicGraph.nodes.find((node) => node.id === arguedDiagramPart.targetId);
    if (!sourceNode || !targetNode) {
      throw errorWithData("edge nodes not found", arguedDiagramPart, topicGraph);
    }

    return (
      `${prettyNodeTypes[sourceNode.type]} "${sourceNode.data.text}" ` +
      lowerCase(arguedDiagramPart.data.customLabel ?? arguedDiagramPart.type) +
      ` ${prettyNodeTypes[targetNode.type]} "${targetNode.data.text}"`
    );
  }
};

export const isJustificationEdge = (graphPart: GraphPart) => {
  return !isNode(graphPart) && justificationRelationNames.includes(graphPart.type);
};
