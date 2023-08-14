import lowerCase from "lodash/lowerCase";

import { errorWithData } from "../../../common/errorHandling";
import { Diagram, Edge, GraphPartType } from "./diagram";

// this should work for arguables too
export const hasClaims = (edge: Edge, diagram: Diagram, claimTrees: Diagram[]) => {
  const claimTree = claimTrees.find((diagram) => diagram.id === edge.id);
  if (!claimTree) return false;

  return claimTree.nodes.length > 1; // one node will be the implicit claim, don't count that
};

export const getImplicitLabel = (
  diagramPartId: string,
  diagramPartType: GraphPartType,
  topicDiagram: Diagram
): string => {
  if (diagramPartType === "node") {
    const topicDiagramNode = topicDiagram.nodes.find((node) => node.id === diagramPartId);
    if (!topicDiagramNode) {
      throw errorWithData("topic diagram node not found", diagramPartId, topicDiagram);
    }

    return `"${topicDiagramNode.data.label}" is important`;
  } else {
    const topicDiagramEdge = topicDiagram.edges.find((edge) => edge.id === diagramPartId);
    if (!topicDiagramEdge) {
      throw errorWithData("topic diagram edge not found", diagramPartId, topicDiagram);
    }

    const sourceNode = topicDiagram.nodes.find((node) => node.id === topicDiagramEdge.source);
    const targetNode = topicDiagram.nodes.find((node) => node.id === topicDiagramEdge.target);
    if (!sourceNode || !targetNode) {
      throw errorWithData("edge nodes not found", topicDiagramEdge, topicDiagram);
    }

    return `"${targetNode.data.label}" ${lowerCase(topicDiagramEdge.label)} "${
      sourceNode.data.label
    }"`;
  }
};
