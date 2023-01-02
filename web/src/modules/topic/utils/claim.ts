import _ from "lodash";

import { ComponentType, DiagramState } from "./diagram";
import { maxCharsPerLine } from "./nodes";

export const getClaimDiagramId = (parentId: string, parentType: ComponentType) => {
  return `${parentType}-${parentId}`;
};

export const getImplicitLabel = (
  parentId: string,
  parentType: ComponentType,
  parentDiagram: DiagramState
): string => {
  if (parentType === "node") {
    const parentNode = parentDiagram.nodes.find((node) => node.id === parentId);
    if (!parentNode) throw new Error("parent not found");

    const maxLabelLength = maxCharsPerLine * 2 - `""`.length; // hardcoded chars will fit in one line, so label can have the other two lines
    const truncatedNodeLabel = _.truncate(parentNode.data.label, { length: maxLabelLength });

    return `"${truncatedNodeLabel}" is important`;
  } else {
    const parentEdge = parentDiagram.edges.find((edge) => edge.id === parentId);
    if (!parentEdge) throw new Error("parent not found");

    const sourceNode = parentDiagram.nodes.find((node) => node.id === parentEdge.source);
    const targetNode = parentDiagram.nodes.find((node) => node.id === parentEdge.target);
    if (!sourceNode || !targetNode) throw new Error("edge nodes not found");

    const maxLabelLength = maxCharsPerLine - `""`.length; // hardcoded chars will fit in one line, so both labels can have their own line

    const truncatedSourceLabel = _.truncate(sourceNode.data.label, { length: maxLabelLength });
    const truncatedTargetLabel = _.truncate(targetNode.data.label, { length: maxLabelLength });

    return `"${truncatedTargetLabel}" ${parentEdge.label} "${truncatedSourceLabel}"`;
  }
};
