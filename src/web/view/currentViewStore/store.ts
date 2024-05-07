import mergeWith from "lodash/mergeWith";
import union from "lodash/union";
import without from "lodash/without";
import { temporal } from "zundo";
import { useStore } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import { Format, InfoCategory } from "../../../common/infoCategory";
import { infoNodeTypes, nodeTypes } from "../../../common/node";
import { emitter } from "../../common/event";
import { useGraphPart } from "../../topic/store/graphPartHooks";
import { getDefaultNode } from "../../topic/store/nodeGetters";
import { useTopicStore } from "../../topic/store/store";
import { findNodeOrThrow } from "../../topic/utils/graph";
import { neighbors } from "../../topic/utils/node";
import { DiagramFilter, StandardFilter, StandardFilterWithFallbacks } from "../utils/diagramFilter";
import { GeneralFilter } from "../utils/generalFilter";
import { TableFilter } from "../utils/tableFilter";

interface CurrentViewStoreState {
  selectedGraphPartId: string | null;
  format: Format;

  // info category state is flattened (rather than `[category]: state`) for ease of modifying
  categoriesToShow: InfoCategory[];
  structureFilter: StandardFilter;
  researchFilter: StandardFilter;
  justificationFilter: StandardFilter;

  tableFilter: TableFilter;
  generalFilter: GeneralFilter;
}

const initialState: CurrentViewStoreState = {
  selectedGraphPartId: null,
  format: "diagram",

  categoriesToShow: ["structure"],
  structureFilter: { type: "none" },
  researchFilter: { type: "none" },
  justificationFilter: { type: "none" },

  tableFilter: {
    solutions: [],
    criteria: [],
  },
  generalFilter: {
    nodeTypes: [...nodeTypes], // spread because this value is otherwise readonly
    showOnlyScored: false,
    scoredComparer: "≥",
    scoreToCompare: "5",
    nodesToShow: [],
    nodesToHide: [],
    showSecondaryResearch: false,
    showSecondaryStructure: true,
  },
};

const persistedNameBase = "navigateStore";

const useCurrentViewStore = createWithEqualityFn<CurrentViewStoreState>()(
  temporal(
    persist(
      devtools(() => initialState),
      {
        name: persistedNameBase,
        version: 1,
        skipHydration: true,
      }
    )
  ),

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  // e.g. when we return URLSearchParams
  Object.is
);

// temporal store is a vanilla store, we need to wrap it to use it as a hook and be able to react to changes
const useTemporalStore = () => useStore(useCurrentViewStore.temporal);

// hooks
export const useSelectedGraphPart = () => {
  const selectedGraphPartId = useCurrentViewStore((state) => state.selectedGraphPartId);

  return useGraphPart(selectedGraphPartId);
};

export const useIsGraphPartSelected = (graphPartId: string) => {
  return useCurrentViewStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return state.selectedGraphPartId === graphPartId;
  });
};

export const useIsAnyGraphPartSelected = (graphPartIds: string[]) => {
  return useCurrentViewStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return graphPartIds.includes(state.selectedGraphPartId);
  });
};

export const useFormat = () => {
  return useCurrentViewStore((state) => state.format);
};

const useCategoriesToShow = () => {
  return useCurrentViewStore((state) => state.categoriesToShow, shallow);
};

const useStandardFilter = (category: InfoCategory) => {
  return useCurrentViewStore((state) => state[`${category}Filter`], shallow);
};

export const useDiagramFilter = (): DiagramFilter => {
  const categoriesToShow = useCategoriesToShow();
  const structureFilter = useStandardFilter("structure");
  const researchFilter = useStandardFilter("research");
  const justificationFilter = useStandardFilter("justification");

  return {
    structure: { show: categoriesToShow.includes("structure"), ...structureFilter },
    research: { show: categoriesToShow.includes("research"), ...researchFilter },
    justification: { show: categoriesToShow.includes("justification"), ...justificationFilter },
  };
};

export const useTableFilter = (): TableFilter => {
  return useCurrentViewStore(
    (state) => state.tableFilter,
    (before, after) => JSON.stringify(before) === JSON.stringify(after)
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

export const usePrimaryNodeTypes = () => {
  return useCurrentViewStore((state) => {
    return state.categoriesToShow.flatMap((category) => infoNodeTypes[category]);
  });
};

export const useCanGoBackForward = () => {
  const temporalStore = useTemporalStore();

  const canGoBack = temporalStore.pastStates.length > 0;
  const canGoForward = temporalStore.futureStates.length > 0;
  return [canGoBack, canGoForward];
};

// actions
export const setSelected = (graphPartId: string | null) => {
  useCurrentViewStore.setState({ selectedGraphPartId: graphPartId }, false, "setSelected");
};

export const setFormat = (format: Format) => {
  useCurrentViewStore.setState({ format }, false, "setFormat");
};

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
      "setShowInformation"
    );
    emitter.emit("changedDiagramFilter");
  }
};

export const setStandardFilter = (category: InfoCategory, filter: StandardFilter) => {
  const newFilter =
    category === "structure"
      ? { structureFilter: filter }
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
    "viewCriteriaTable"
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
    "viewJustification"
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

export const goBack = () => {
  useCurrentViewStore.temporal.getState().undo();
};

export const goForward = () => {
  useCurrentViewStore.temporal.getState().redo();
};

export const resetView = (keepHistory = false) => {
  useCurrentViewStore.setState(initialState, true, "resetView");
  if (!keepHistory) useCurrentViewStore.temporal.getState().clear();

  emitter.emit("changedDiagramFilter");
};

const withDefaults = <T>(value: Partial<T>, defaultValue: T): T => {
  // thanks https://stackoverflow.com/a/66247134/8409296
  // empty object to avoid mutation
  return mergeWith({}, defaultValue, value, (_a, b) => (Array.isArray(b) ? b : undefined));
};

export const loadView = async (persistId: string) => {
  const builtPersistedName = `${persistedNameBase}-${persistId}`;

  useCurrentViewStore.persist.setOptions({ name: builtPersistedName });

  if (useCurrentViewStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useCurrentViewStore.persist.rehydrate();

    // use initial state to fill missing values in the persisted state
    // e.g. so that a new non-null value in initialState is non-null in the persisted state,
    // removing the need to write a migration for every new field
    const persistedState = useCurrentViewStore.getState();
    const persistedWithDefaults = withDefaults(persistedState, initialState);

    useCurrentViewStore.setState(persistedWithDefaults, true, "loadView");
  } else {
    useCurrentViewStore.setState(initialState, true, "loadView");
  }

  // it doesn't make sense to want to undo a page load
  useCurrentViewStore.temporal.getState().clear();
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
