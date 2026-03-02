import { sortBy, uniqBy } from "es-toolkit/compat";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import { getDisplayScoresByGraphPartId } from "@/web/topic/diagramStore/scoreGetters";
import { UserScores, useDiagramStore } from "@/web/topic/diagramStore/store";
import { Diagram } from "@/web/topic/utils/diagram";
import { Node, getRelevantEdges, getSecondaryNeighbors } from "@/web/topic/utils/graph";
import { AggregationMode } from "@/web/topic/utils/score";
import { getInfoFilter } from "@/web/view/currentViewStore/filter";
import { useCurrentViewStore } from "@/web/view/currentViewStore/store";
import { usePerspectiveStore } from "@/web/view/perspectiveStore";
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

interface FilteredDiagramState {
  filteredDiagram: Diagram;
}

const useFilteredDiagramStore = createWithEqualityFn<FilteredDiagramState>()(
  () => ({ filteredDiagram: { nodes: [], edges: [] } }),
  Object.is,
);

// hooks
export const useFilteredDiagram = (): Diagram => {
  return useFilteredDiagramStore((state) => state.filteredDiagram, shallow);
};

/**
 * Finds nodes that are hidden by the current set of filters.
 *
 * This is calculated from the filtered diagram rather than from React Flow's internal state,
 * so that it stays in sync without waiting for a React Flow render cycle.
 */
export const useHiddenNodes = (nodes: Node[]): Node[] => {
  return useFilteredDiagramStore((state) => {
    const displayedNodeIds = new Set(state.filteredDiagram.nodes.map((n) => n.id));
    return nodes.filter((node) => !displayedNodeIds.has(node.id));
  }, shallow);
};

// actions
export const computeFilteredDiagram = () => {
  const { nodes, edges, userScores } = useDiagramStore.getState();

  const viewState = useCurrentViewStore.getState();
  const infoFilter = getInfoFilter(viewState);
  const { generalFilter, showImpliedEdges, showProblemCriterionSolutionEdges } = viewState;

  const { perspectives, aggregationMode } = usePerspectiveStore.getState();

  const filteredDiagram = applyFilters(
    { nodes, edges },
    userScores,
    infoFilter,
    generalFilter,
    showImpliedEdges,
    showProblemCriterionSolutionEdges,
    perspectives,
    aggregationMode,
  );

  useFilteredDiagramStore.setState({ filteredDiagram });
};

// helpers
export const getFilteredDiagram = (): Diagram => {
  return useFilteredDiagramStore.getState().filteredDiagram;
};

// utils
const applyFilters = (
  diagram: Diagram,
  userScores: UserScores,
  infoFilter: InfoFilter,
  generalFilter: GeneralFilter,
  showImpliedEdges: boolean,
  showProblemCriterionSolutionEdges: boolean,
  perspectives: string[],
  aggregationMode: AggregationMode,
): Diagram => {
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
  const edgesAfterImplied = showImpliedEdges
    ? relevantEdges
    : hideImpliedEdges(relevantEdges, { nodes: filteredNodes, edges: relevantEdges }, diagram);

  const filteredEdges = showProblemCriterionSolutionEdges
    ? edgesAfterImplied
    : hideProblemCriterionSolutionEdges(filteredNodes, edgesAfterImplied);

  // sort nodes/edges to ensure layout doesn't change if nodes/edges occur in a different order
  return { nodes: sortBy(filteredNodes, "id"), edges: sortBy(filteredEdges, "id") };
};

/**
 * Recompute when related store data changes.
 *
 * Note 1: subscribe to any diagram store changes - we don't want to exclude e.g. node notes/label
 * changes so that our components using this store can trust that this store has latest data for all
 * fields.
 *
 * Note 2: we can avoid recomputing on unrelated view state changes though (e.g. layout options,
 * table filter, format) because the filtered nodes/edges don't use those fields.
 */
useDiagramStore.subscribe(computeFilteredDiagram);
usePerspectiveStore.subscribe(computeFilteredDiagram);

useCurrentViewStore.subscribe(
  (state) => ({
    categoriesToShow: state.categoriesToShow,
    breakdownFilter: state.breakdownFilter,
    researchFilter: state.researchFilter,
    justificationFilter: state.justificationFilter,
    generalFilter: state.generalFilter,
    showImpliedEdges: state.showImpliedEdges,
    showProblemCriterionSolutionEdges: state.showProblemCriterionSolutionEdges,
  }),
  computeFilteredDiagram,
  { equalityFn: shallow },
);
