import { union, without } from "es-toolkit";
import { shallow } from "zustand/shallow";

import { InfoCategory } from "@/common/infoCategory";
import { emitter } from "@/web/common/event";
import { getDefaultNode, getNeighbors } from "@/web/topic/diagramStore/nodeGetters";
import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { findNodeOrThrow } from "@/web/topic/utils/graph";
import { neighbors } from "@/web/topic/utils/node";
import { initialViewState, useCurrentViewStore } from "@/web/view/currentViewStore/store";
import {
  getCriterionContextFilter,
  getFulfillsContextFilter,
  getSolutionContextFilter,
} from "@/web/view/utils/contextFilters";
import { GeneralFilter } from "@/web/view/utils/generalFilter";
import {
  InfoFilter,
  StandardFilter,
  StandardFilterWithFallbacks,
} from "@/web/view/utils/infoFilter";
import { TableFilter } from "@/web/view/utils/tableFilter";

// hooks
const useCategoriesToShow = () => {
  return useCurrentViewStore((state) => state.categoriesToShow, shallow);
};

const useStandardFilter = (category: InfoCategory) => {
  return useCurrentViewStore((state) => state[`${category}Filter`], shallow);
};

export const useInfoFilter = (): InfoFilter => {
  const categoriesToShow = useCategoriesToShow();
  const breakdownFilter = useStandardFilter("breakdown");
  const researchFilter = useStandardFilter("research");
  const justificationFilter = useStandardFilter("justification");

  return {
    breakdown: { show: categoriesToShow.includes("breakdown"), ...breakdownFilter },
    research: { show: categoriesToShow.includes("research"), ...researchFilter },
    justification: { show: categoriesToShow.includes("justification"), ...justificationFilter },
  };
};

export const useTableFilter = (): TableFilter => {
  return useCurrentViewStore(
    (state) => state.tableFilter,
    (before, after) => JSON.stringify(before) === JSON.stringify(after),
  );
};

export const useTableFilterWithFallbacks = (): TableFilter => {
  const tableFilter = useTableFilter();

  const centralProblemId = getDefaultNode("problem")?.id;

  const tableFilterDefaults = {
    centralProblemId,
    solutions: [],
    criteria: [],
  };

  return { ...tableFilterDefaults, ...tableFilter };
};

export const useGeneralFilter = () => {
  return useCurrentViewStore((state) => state.generalFilter);
};

export const useIsNodeForcedToShow = (nodeId: string) => {
  return useCurrentViewStore((state) => state.generalFilter.nodesToShow.includes(nodeId));
};

export const useShowImpliedEdges = () => {
  return useCurrentViewStore((state) => state.showImpliedEdges);
};

export const useShowProblemCriterionSolutionEdges = () => {
  return useCurrentViewStore((state) => state.showProblemCriterionSolutionEdges);
};

// actions
export const setShowInformation = (category: InfoCategory, show: boolean) => {
  const oldCategoriesToShow = useCurrentViewStore.getState().categoriesToShow;

  const newCategoriesToShow =
    show && !oldCategoriesToShow.includes(category)
      ? [...oldCategoriesToShow, category]
      : !show && oldCategoriesToShow.includes(category)
        ? oldCategoriesToShow.filter((c) => c !== category)
        : null;

  if (newCategoriesToShow) {
    useCurrentViewStore.setState(
      { categoriesToShow: newCategoriesToShow },
      false,
      "setShowInformation",
    );
    emitter.emit("changedDiagramFilter");
  }
};

export const setStandardFilter = (category: InfoCategory, filter: StandardFilter) => {
  const newFilter =
    category === "breakdown"
      ? { breakdownFilter: filter }
      : category === "research"
        ? { researchFilter: filter }
        : { justificationFilter: filter };

  useCurrentViewStore.setState(newFilter, false, "setStandardFilter");

  emitter.emit("changedDiagramFilter");
};

export const setTableFilter = (tableFilter: TableFilter) => {
  useCurrentViewStore.setState({ tableFilter }, false, "setTableFilter");
};

export const setGeneralFilter = (generalFilter: GeneralFilter) => {
  useCurrentViewStore.setState({ generalFilter }, false, "setGeneralFilter");
  emitter.emit("changedDiagramFilter");
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useCurrentViewStore.setState(
    {
      format: "table",
      tableFilter: {
        centralProblemId: problemNodeId,
        solutions: [],
        criteria: [],
      },
    },
    false,
    "viewCriteriaTable",
  );
};

export const viewJustification = (arguedDiagramPartId: string) => {
  useCurrentViewStore.setState(
    {
      ...initialViewState,
      format: "diagram",
      categoriesToShow: ["justification"],
      justificationFilter: { type: "rootClaim", centralRootClaimId: arguedDiagramPartId },
    },
    false,
    "viewJustification",
  );
  emitter.emit("changedDiagramFilter");
};

export const viewSolutionContext = (solutionId: string) => {
  const graph = useDiagramStore.getState();

  useCurrentViewStore.setState(
    {
      ...initialViewState,
      breakdownFilter: getSolutionContextFilter(graph, solutionId),
    },
    false,
    "viewSolutionContext",
  );
  emitter.emit("changedDiagramFilter");
};

export const viewCriterionContext = (criterionId: string) => {
  const graph = useDiagramStore.getState();

  useCurrentViewStore.setState(
    {
      ...initialViewState,
      breakdownFilter: getCriterionContextFilter(graph, criterionId),
      // could have the standard filter control this, but this way allows users to use the standard
      // filter and choose to show the extra edges if they want
      showProblemCriterionSolutionEdges: false,
      forceNodesIntoLayers: true, // otherwise hidden edges will scatter nodes
      layerNodeIslandsTogether: true, // otherwise hidden edges will scatter nodes
    },
    false,
    "viewCriterionContext",
  );
  emitter.emit("changedDiagramFilter");
};

export const viewFulfillsEdgeContext = (fulfillsEdgeId: string) => {
  const graph = useDiagramStore.getState();

  useCurrentViewStore.setState(
    {
      ...initialViewState,
      breakdownFilter: getFulfillsContextFilter(graph, fulfillsEdgeId),
      // could have the standard filter control this, but this way allows users to use the standard
      // filter and choose to show the extra edges if they want
      showProblemCriterionSolutionEdges: false,
      forceNodesIntoLayers: true, // otherwise hidden edges will scatter nodes
      layerNodeIslandsTogether: true, // otherwise hidden edges will scatter nodes
    },
    false,
    "viewFulfillsContext",
  );
  emitter.emit("changedDiagramFilter");
};

export const viewNodeInDiagram = (nodeId: string) => {
  const viewState = useCurrentViewStore.getState();

  // TODO: use better filtering than just picking explicit neighbors to show - probably add a focused filter of some kind
  const nodeNeighbors = getNeighbors(nodeId);

  useCurrentViewStore.setState(
    {
      format: "diagram",
      categoriesToShow: [],
      generalFilter: {
        ...viewState.generalFilter,
        nodesToShow: [nodeId, ...nodeNeighbors.map((n) => n.id)],
        nodesToHide: [],
      },
    },
    false,
    "viewNodeInDiagram",
  );

  emitter.emit("changedDiagramFilter");
  // TODO: centralize, but don't centralize so far zoomed in...
  // setPartIdToCentralize(nodeId);
};

/**
 * @param also true if these nodes should be added to the current filter, false if they should be the only nodes displayed
 */
export const showNodeAndNeighbors = (nodeId: string, also: boolean) => {
  const { categoriesToShow, generalFilter } = useCurrentViewStore.getState();
  const graph = useDiagramStore.getState();
  const node = findNodeOrThrow(nodeId, graph.nodes);

  const nodeAndNeighbors = [nodeId, ...neighbors(node, graph).map((neighbor) => neighbor.id)];

  useCurrentViewStore.setState({
    format: "diagram",
    categoriesToShow: also ? categoriesToShow : [],
    generalFilter: {
      ...generalFilter,
      nodesToShow: also ? union(generalFilter.nodesToShow, nodeAndNeighbors) : nodeAndNeighbors,
      nodesToHide: without(generalFilter.nodesToHide, ...nodeAndNeighbors),
    },
  });

  emitter.emit("changedDiagramFilter");
};

export const stopForcingNodeToShow = (nodeId: string) => {
  const generalFilter = useCurrentViewStore.getState().generalFilter;

  useCurrentViewStore.setState({
    generalFilter: {
      ...generalFilter,
      nodesToShow: without(generalFilter.nodesToShow, nodeId),
    },
  });
};

export const showNode = (nodeId: string) => {
  const generalFilter = useCurrentViewStore.getState().generalFilter;

  useCurrentViewStore.setState({
    generalFilter: {
      ...generalFilter,
      nodesToShow: union(generalFilter.nodesToShow, [nodeId]),
      nodesToHide: without(generalFilter.nodesToHide, nodeId),
    },
  });

  emitter.emit("changedDiagramFilter");
};

export const hideNode = (nodeId: string) => {
  const generalFilter = useCurrentViewStore.getState().generalFilter;

  useCurrentViewStore.setState({
    generalFilter: {
      ...generalFilter,
      nodesToShow: without(generalFilter.nodesToShow, nodeId),
      nodesToHide: union(generalFilter.nodesToHide, [nodeId]),
    },
  });

  emitter.emit("changedDiagramFilter");
};

export const toggleShowImpliedEdges = (show: boolean) => {
  useCurrentViewStore.setState({ showImpliedEdges: show });

  emitter.emit("changedDiagramFilter");
};

export const toggleShowProblemCriterionSolutionEdges = (show: boolean) => {
  useCurrentViewStore.setState({ showProblemCriterionSolutionEdges: show });

  emitter.emit("changedDiagramFilter");
};

// helpers
export const getStandardFilterWithFallbacks = (standardFilter: StandardFilter): StandardFilter => {
  const centralProblemId = getDefaultNode("problem")?.id;
  const centralSolutionId = getDefaultNode("solution")?.id;
  const centralQuestionId = getDefaultNode("question")?.id;
  const centralSourceId = getDefaultNode("source")?.id;
  const centralRootClaimId = getDefaultNode("rootClaim")?.id;

  const standardFilterDefaults: StandardFilterWithFallbacks = {
    type: "none",
    layersDeep: 1,
    centralProblemId,
    problemDetails: ["causes", "effects", "subproblems", "criteria", "solutions"],
    centralSolutionId,
    solutionDetail: "all",
    solutions: [],
    criteria: [],
    centralQuestionId,
    centralSourceId,
    centralRootClaimId,
  };

  // override any defaults using the stored filter
  return { ...standardFilterDefaults, ...standardFilter };
};
