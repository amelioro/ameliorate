import lowerCase from "lodash/lowerCase";

import { errorWithData } from "../../../common/errorHandling";
import { ArguableType, Diagram, Edge, findArguable } from "./diagram";

export const parseClaimTreeId = (diagramId: string) => {
  return diagramId.split("-") as [ArguableType, string];
};

export const getRootArguable = (claimTreeId: string, topicDiagram: Diagram) => {
  const [parentArguableType, parentArguableId] = parseClaimTreeId(claimTreeId);
  const arguable = findArguable(parentArguableId, parentArguableType, topicDiagram);
  return arguable;
};

// TODO: this should work for arguables. annoying to do without knowing the arguable type though.
// this will be much easier after adding the child claim diagram pointer to Arguable
export const hasClaims = (edge: Edge, diagram: Diagram, claimTrees: Diagram[]) => {
  const claimTree = claimTrees.find((diagram) => diagram.id === edge.id);
  if (!claimTree) return false;

  return claimTree.nodes.length > 1; // one node will be the implicit claim, don't count that
};

// "parent" meaning the node or edge implies the claim
export const getImplicitLabel = (
  parentArguableId: string,
  parentArguableType: ArguableType,
  parentArguableDiagram: Diagram
): string => {
  if (parentArguableType === "node") {
    const parentNode = parentArguableDiagram.nodes.find((node) => node.id === parentArguableId);
    if (!parentNode) {
      throw errorWithData("parent not found", parentArguableId, parentArguableDiagram);
    }

    return `"${parentNode.data.label}" is important`;
  } else {
    const parentEdge = parentArguableDiagram.edges.find((edge) => edge.id === parentArguableId);
    if (!parentEdge) {
      throw errorWithData("parent not found", parentArguableId, parentArguableDiagram);
    }

    const sourceNode = parentArguableDiagram.nodes.find((node) => node.id === parentEdge.source);
    const targetNode = parentArguableDiagram.nodes.find((node) => node.id === parentEdge.target);
    if (!sourceNode || !targetNode) {
      throw errorWithData("edge nodes not found", parentEdge, parentArguableDiagram);
    }

    return `"${targetNode.data.label}" ${lowerCase(parentEdge.label)} "${sourceNode.data.label}"`;
  }
};
