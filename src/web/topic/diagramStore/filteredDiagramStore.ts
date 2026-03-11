import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import { type CalculatedEdge } from "@/common/edge";
import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { FilteredDiagram, applyFilters } from "@/web/topic/utils/diagramFilter";
import { Node } from "@/web/topic/utils/graph";
import { isIndirectEdge } from "@/web/topic/utils/indirectEdges";
import { getInfoFilter } from "@/web/view/currentViewStore/filter";
import { useCurrentViewStore } from "@/web/view/currentViewStore/store";
import { usePerspectiveStore } from "@/web/view/perspectiveStore";

interface FilteredDiagramState {
  filteredDiagram: FilteredDiagram;
}

const useFilteredDiagramStore = createWithEqualityFn<FilteredDiagramState>()(
  () => ({ filteredDiagram: { nodes: [], edges: [] } }),
  Object.is,
);

// hooks
export const useFilteredDiagram = (): FilteredDiagram => {
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

export const useDisplayedEdgeIds = (nodeId: string): string[] => {
  return useFilteredDiagramStore(
    (state) =>
      state.filteredDiagram.edges
        .filter((edge) => edge.sourceId === nodeId || edge.targetId === nodeId)
        .map((edge) => edge.id),
    shallow,
  );
};

export const useDisplayedNeighborIds = (nodeId: string): string[] => {
  return useFilteredDiagramStore(
    (state) =>
      state.filteredDiagram.edges
        .filter((edge) => edge.sourceId === nodeId || edge.targetId === nodeId)
        .map((edge) => (edge.sourceId === nodeId ? edge.targetId : edge.sourceId)),
    shallow,
  );
};

export const useIndirectEdge = (edgeId: string | null): CalculatedEdge | null => {
  return useFilteredDiagramStore((state) => {
    if (!edgeId) return null;

    const edge = state.filteredDiagram.edges.find((edge) => edge.id === edgeId);
    if (!edge || !isIndirectEdge(edge)) return null;

    return edge;
  });
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
export const getFilteredDiagram = (): FilteredDiagram => {
  return useFilteredDiagramStore.getState().filteredDiagram;
};

export const getIndirectEdge = (edgeId: string): CalculatedEdge | null => {
  const filteredDiagram = useFilteredDiagramStore.getState().filteredDiagram;

  const edge = filteredDiagram.edges.find((edge) => edge.id === edgeId);
  if (!edge || !isIndirectEdge(edge)) return null;

  return edge;
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
