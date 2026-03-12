import { sortBy, uniqBy } from "es-toolkit/compat";

import { Diagram } from "@/web/topic/utils/diagram";
import {
  type Edge,
  type Node,
  getRelevantEdges,
  getSecondaryNeighbors,
} from "@/web/topic/utils/graph";
import { type IndirectEdge, getIndirectEdges } from "@/web/topic/utils/indirectEdges";
import {
  AggregationMode,
  UserScores,
  getDisplayScoresByGraphPartId,
} from "@/web/topic/utils/score";
import {
  GeneralFilter,
  applyNodeTypeFilter,
  applyScoreFilter,
} from "@/web/view/utils/generalFilter";
import { InfoFilter, applyInfoFilter } from "@/web/view/utils/infoFilter";
import {
  hideImpliedEdges,
  hideProblemCriterionSolutionEdges,
} from "@/web/view/utils/miscDiagramFilters";

export interface FilteredDiagram {
  nodes: Node[];
  edges: (Edge | IndirectEdge)[];
}

export const applyFilters = (
  diagram: Diagram,
  userScores: UserScores,
  infoFilter: InfoFilter,
  generalFilter: GeneralFilter,
  showImpliedEdges: boolean,
  showProblemCriterionSolutionEdges: boolean,
  perspectives: string[],
  aggregationMode: AggregationMode,
): FilteredDiagram => {
  const nodesAfterDiagramFilter = applyInfoFilter(diagram, infoFilter);

  const nodesAfterTypeFilter = applyNodeTypeFilter(
    nodesAfterDiagramFilter,
    generalFilter.nodeTypes,
  );

  // don't filter edges because hard to prevent awkwardness when edge doesn't pass filter and suddenly nodes are scattered
  const partIdsForScores = diagram.nodes.map((part) => part.id);
  const scores = getDisplayScoresByGraphPartId(
    partIdsForScores,
    perspectives,
    userScores,
    aggregationMode,
  );
  const nodesAfterScoreFilter = applyScoreFilter(nodesAfterTypeFilter, generalFilter, scores);

  const nodesToShow = diagram.nodes.filter((node) => generalFilter.nodesToShow.includes(node.id));
  const nodesAfterToShow = uniqBy(nodesAfterScoreFilter.concat(nodesToShow), "id");

  const secondaryNeighbors = getSecondaryNeighbors(nodesAfterToShow, diagram, generalFilter);

  const nodesBeforeHide = nodesAfterToShow.concat(secondaryNeighbors);
  const nodesAfterHide = nodesBeforeHide.filter(
    (node) => !generalFilter.nodesToHide.includes(node.id),
  );

  const filteredNodes = uniqBy(nodesAfterHide, "id");

  const relevantEdges = getRelevantEdges(filteredNodes, diagram);
  const indirectEdges = getIndirectEdges({ nodes: filteredNodes, edges: relevantEdges }, diagram);
  const displayedEdges = [...relevantEdges, ...indirectEdges];

  // hide edges if configured to
  const edgesAfterImplied = showImpliedEdges
    ? displayedEdges
    : hideImpliedEdges(displayedEdges, { nodes: filteredNodes, edges: relevantEdges }, diagram);

  const filteredEdges = showProblemCriterionSolutionEdges
    ? edgesAfterImplied
    : hideProblemCriterionSolutionEdges(filteredNodes, edgesAfterImplied);

  // sort nodes/edges to ensure layout doesn't change if nodes/edges occur in a different order
  return { nodes: sortBy(filteredNodes, "id"), edges: sortBy(filteredEdges, "id") };
};
