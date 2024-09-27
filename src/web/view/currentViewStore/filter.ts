import union from "lodash/union";
import without from "lodash/without";
import { shallow } from "zustand/shallow";

import { InfoCategory } from "@/common/infoCategory";
import { emitter } from "@/web/common/event";
import { getDefaultNode } from "@/web/topic/store/nodeGetters";
import { useTopicStore } from "@/web/topic/store/store";
import { findNodeOrThrow } from "@/web/topic/utils/graph";
import { neighbors } from "@/web/topic/utils/node";
import { useCurrentViewStore } from "@/web/view/currentViewStore/store";
import {
  DiagramFilter,
  StandardFilter,
  StandardFilterWithFallbacks,
} from "@/web/view/utils/diagramFilter";
import { GeneralFilter } from "@/web/view/utils/generalFilter";
import { TableFilter } from "@/web/view/utils/tableFilter";

// hooks
const useCategoriesToShow = () => {
  return useCurrentViewStore((state) => state.categoriesToShow, shallow);
};

const useStandardFilter = (category: InfoCategory) => {
  return useCurrentViewStore((state) => state[`${category}Filter`], shallow);
};

export const useDiagramFilter = (): DiagramFilter => {
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
      format: "diagram",
      categoriesToShow: ["justification"],
      justificationFilter: { type: "rootClaim", centralRootClaimId: arguedDiagramPartId },
    },
    false,
    "viewJustification",
  );
};

/**
 * @param also true if these nodes should be added to the current filter, false if they should be the only nodes displayed
 */
export const showNodeAndNeighbors = (nodeId: string, also: boolean) => {
  const { categoriesToShow, generalFilter } = useCurrentViewStore.getState();
  const graph = useTopicStore.getState();
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

// helpers
export const getStandardFilterWithFallbacks = (standardFilter: StandardFilter): StandardFilter => {
  const centralProblemId = getDefaultNode("problem")?.id;
  const centralSolutionId = getDefaultNode("solution")?.id;
  const centralQuestionId = getDefaultNode("question")?.id;
  const centralSourceId = getDefaultNode("source")?.id;
  const centralRootClaimId = getDefaultNode("rootClaim")?.id;

  const standardFilterDefaults: StandardFilterWithFallbacks = {
    type: "none",
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
