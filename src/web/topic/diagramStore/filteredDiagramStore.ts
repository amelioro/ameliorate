import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { Diagram } from "@/web/topic/utils/diagram";
import { applyFilters } from "@/web/topic/utils/diagramFilter";
import { Node } from "@/web/topic/utils/graph";
import { getInfoFilter } from "@/web/view/currentViewStore/filter";
import { useCurrentViewStore } from "@/web/view/currentViewStore/store";
import { usePerspectiveStore } from "@/web/view/perspectiveStore";

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
