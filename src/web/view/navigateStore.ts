import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import { Format, InfoCategory } from "../../common/infoCategory";
import { infoNodeTypes, nodeTypes } from "../../common/node";
import { emitter } from "../common/event";
import { useGraphPart } from "../topic/store/graphPartHooks";
import { getDefaultNode } from "../topic/store/nodeGetters";
import { DiagramFilter, StandardFilter, StandardFilterWithFallbacks } from "./utils/diagramFilter";
import { GeneralFilter } from "./utils/generalFilter";
import { TableFilter } from "./utils/tableFilter";

export type View = "topicDiagram" | "researchDiagram" | "criteriaTable" | "claimTree";

export interface NavigateStoreState {
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

export const initialState: NavigateStoreState = {
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
    showSecondaryResearch: false,
    showSecondaryStructure: true,
  },
};

export const useNavigateStore = createWithEqualityFn<NavigateStoreState>()(
  () => initialState,

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  // e.g. when we return URLSearchParams
  Object.is
);

// hooks
export const useSelectedGraphPart = () => {
  const selectedGraphPartId = useNavigateStore((state) => state.selectedGraphPartId);

  return useGraphPart(selectedGraphPartId);
};

export const useIsGraphPartSelected = (graphPartId: string) => {
  return useNavigateStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return state.selectedGraphPartId === graphPartId;
  });
};

export const useIsAnyGraphPartSelected = (graphPartIds: string[]) => {
  return useNavigateStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return graphPartIds.includes(state.selectedGraphPartId);
  });
};

export const useFormat = () => {
  return useNavigateStore((state) => state.format);
};

const useCategoriesToShow = () => {
  return useNavigateStore((state) => state.categoriesToShow, shallow);
};

const useStandardFilter = (category: InfoCategory) => {
  return useNavigateStore((state) => state[`${category}Filter`], shallow);
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
  return useNavigateStore(
    (state) => state.tableFilter,
    (before, after) => JSON.stringify(before) === JSON.stringify(after)
  );
};

export const useGeneralFilter = () => {
  return useNavigateStore((state) => state.generalFilter);
};

export const usePrimaryNodeTypes = () => {
  return useNavigateStore((state) => {
    return state.categoriesToShow.flatMap((category) => infoNodeTypes[category]);
  });
};

// actions
export const setSelected = (graphPartId: string | null) => {
  useNavigateStore.setState({ selectedGraphPartId: graphPartId });
};

export const setFormat = (format: Format) => {
  useNavigateStore.setState({ format });
};

export const setShowInformation = (category: InfoCategory, show: boolean) => {
  const categoriesToShow = useNavigateStore.getState().categoriesToShow;

  if (show && !categoriesToShow.includes(category)) {
    useNavigateStore.setState({ categoriesToShow: [...categoriesToShow, category] });
  } else if (!show && categoriesToShow.includes(category)) {
    useNavigateStore.setState({ categoriesToShow: categoriesToShow.filter((c) => c !== category) });
  }

  emitter.emit("changedDiagramFilter");
};

export const setStandardFilter = (category: InfoCategory, filter: StandardFilter) => {
  const currentCategoriesToShow = useNavigateStore.getState().categoriesToShow;
  const categoriesToShow = currentCategoriesToShow.includes(category)
    ? currentCategoriesToShow
    : [...currentCategoriesToShow, category];

  if (category === "structure") {
    useNavigateStore.setState({ categoriesToShow, structureFilter: filter });
  } else if (category === "research") {
    useNavigateStore.setState({ categoriesToShow, researchFilter: filter });
  } else {
    useNavigateStore.setState({ categoriesToShow, justificationFilter: filter });
  }

  emitter.emit("changedDiagramFilter");
};

export const setTableFilter = (tableFilter: TableFilter) => {
  useNavigateStore.setState({ tableFilter });
};

export const setGeneralFilter = (generalFilter: GeneralFilter) => {
  useNavigateStore.setState({ generalFilter });
  emitter.emit("changedDiagramFilter");
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useNavigateStore.setState({
    format: "table",
    tableFilter: {
      centralProblemId: problemNodeId,
      solutions: [],
      criteria: [],
    },
  });
};

export const viewJustification = (arguedDiagramPartId: string) => {
  useNavigateStore.setState({
    format: "diagram",
    categoriesToShow: ["justification"],
    justificationFilter: { type: "rootClaim", centralRootClaimId: arguedDiagramPartId },
  });
};

export const resetNavigation = () => {
  useNavigateStore.setState(initialState);
};

// helpers
export const getStandardFilterWithFallbacks = (
  category: InfoCategory
): StandardFilterWithFallbacks => {
  const standardFilter =
    category === "structure"
      ? useNavigateStore.getState().structureFilter
      : category === "research"
      ? useNavigateStore.getState().researchFilter
      : useNavigateStore.getState().justificationFilter;

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

export const getTableFilterWithFallbacks = (): TableFilter => {
  const tableFilter = useNavigateStore.getState().tableFilter;

  const centralProblemId = getDefaultNode("problem")?.id;

  const tableFilterDefaults = {
    centralProblemId,
    solutions: [],
    criteria: [],
  };

  return { ...tableFilterDefaults, ...tableFilter };
};
