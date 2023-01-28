import _ from "lodash";

import { Diagram, ScorableType } from "./diagram";
import { maxCharsPerLine } from "./nodes";

export const parseClaimDiagramId = (diagramId: string) => {
  return diagramId.split("-") as [ScorableType, string];
};

export const getClaimDiagramId = (parentScorableId: string, parentScorableType: ScorableType) => {
  return `${parentScorableType}-${parentScorableId}`;
};

// "parent" meaning the node or edge implies the claim
export const getImplicitLabel = (
  parentScorableId: string,
  parentScorableType: ScorableType,
  parentScorableDiagram: Diagram
): string => {
  if (parentScorableType === "node") {
    const parentNode = parentScorableDiagram.nodes.find((node) => node.id === parentScorableId);
    if (!parentNode) throw new Error("parent not found");

    const maxLabelLength = maxCharsPerLine * 2 - `""`.length; // hardcoded chars will fit in one line, so label can have the other two lines
    const truncatedNodeLabel = _.truncate(parentNode.data.label, { length: maxLabelLength });

    return `"${truncatedNodeLabel}" is important`;
  } else {
    const parentEdge = parentScorableDiagram.edges.find((edge) => edge.id === parentScorableId);
    if (!parentEdge) throw new Error("parent not found");

    const sourceNode = parentScorableDiagram.nodes.find((node) => node.id === parentEdge.source);
    const targetNode = parentScorableDiagram.nodes.find((node) => node.id === parentEdge.target);
    if (!sourceNode || !targetNode) throw new Error("edge nodes not found");

    const maxLabelLength = maxCharsPerLine - `""`.length; // hardcoded chars will fit in one line, so both labels can have their own line

    const truncatedSourceLabel = _.truncate(sourceNode.data.label, { length: maxLabelLength });
    const truncatedTargetLabel = _.truncate(targetNode.data.label, { length: maxLabelLength });

    return `"${truncatedTargetLabel}" ${parentEdge.label} "${truncatedSourceLabel}"`;
  }
};
