import { useSearchParams } from "next/navigation";
import Router from "next/router";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import { Format, InfoCategory, zFormats } from "../../common/infoCategory";
import { infoNodeTypes, nodeTypes } from "../../common/node";
import { emitter } from "../common/event";
import { useGraphPart } from "../topic/store/graphPartHooks";
import { getDefaultNode } from "../topic/store/nodeGetters";
import { useTopicStore } from "../topic/store/store";
import { DiagramFilter, StandardFilter, StandardFilterWithFallbacks } from "./utils/diagramFilter";
import { GeneralFilter } from "./utils/generalFilter";
import { TableFilter } from "./utils/tableFilter";

export type View = "topicDiagram" | "researchDiagram" | "criteriaTable" | "claimTree";

interface NavigateStoreState {
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

const initialState: NavigateStoreState = {
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

const useNavigateStore = createWithEqualityFn<NavigateStoreState>()(
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
  if (category === "structure") {
    useNavigateStore.setState({ structureFilter: filter });
  } else if (category === "research") {
    useNavigateStore.setState({ researchFilter: filter });
  } else {
    useNavigateStore.setState({ justificationFilter: filter });
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

const findGraphPartIdBySubstring = (graphPartIdSubstring: string | null) => {
  if (!graphPartIdSubstring) return null;

  const state = useTopicStore.getState();

  const graphPart =
    state.nodes.find((node) => node.id.startsWith(graphPartIdSubstring)) ??
    state.edges.find((edge) => edge.id.startsWith(graphPartIdSubstring));

  return graphPart?.id ?? null;
};

const processSearchParams = (searchParams: URLSearchParams) => {
  const selectedGraphPartIdSubstring = searchParams.get("selected")?.toLowerCase() ?? null;
  const selectedGraphPartId = findGraphPartIdBySubstring(selectedGraphPartIdSubstring);
  setSelected(selectedGraphPartId);

  const parsedFormat = zFormats.safeParse(searchParams.get("format")?.toLowerCase());
  if (parsedFormat.success) {
    setFormat(parsedFormat.data);
  }
};

/**
 * Used for search params to keep them short and readable.
 */
const trimPartId = (partId: string) => {
  // Using the first 8 chars, 10000 guids have 1% probability collision
  // This seems reasonable; most topics will have a number of graph parts in the 100s
  return partId.substring(0, 8);
};

const getCalculatedSearchParams = (state: NavigateStoreState) => {
  const selectedParam = state.selectedGraphPartId
    ? `selected=${trimPartId(state.selectedGraphPartId)}`
    : "";

  const formatParam = state.format !== initialState.format ? `format=${state.format}` : "";

  return new URLSearchParams([selectedParam, formatParam].join("&"));
};

const useCalculatedSearchParams = () => {
  return useNavigateStore(
    (state) => getCalculatedSearchParams(state),
    (a, b) => {
      return a.toString() === b.toString();
    }
  );
};

const useUpdateStoreFromSearchParams = (topicDiagramInitiallyLoaded: boolean) => {
  const readonlyUrlSearchParams = useSearchParams();

  // has to be in useEffect because can trigger render of other components
  useEffect(() => {
    // `useSearchParams` was fixed to exclude path params in next 13.4.20-canary.37 https://github.com/vercel/next.js/pull/55280
    // but netlify doesn't support next versions beyond 13.4.19 https://answers.netlify.com/t/runtime-importmoduleerror-error-cannot-find-module-styled-jsx-style/102375/28
    const urlSearchParams = new URLSearchParams(readonlyUrlSearchParams);
    urlSearchParams.delete("username");
    urlSearchParams.delete("topicTitle");

    const calculatedSearchParams = getCalculatedSearchParams(useNavigateStore.getState());
    const storeMatchesURL = urlSearchParams.toString() == calculatedSearchParams.toString();

    if (storeMatchesURL || !topicDiagramInitiallyLoaded) return;

    processSearchParams(urlSearchParams);
  }, [readonlyUrlSearchParams, topicDiagramInitiallyLoaded]);
};

const getNewSearchParamsString = (
  calculatedSearchParams: URLSearchParams,
  oldUrlSearchParams: URLSearchParams
) => {
  const newUrlSearchParams = new URLSearchParams(oldUrlSearchParams.toString());

  const format = calculatedSearchParams.get("format");
  if (format) newUrlSearchParams.set("format", format);
  else newUrlSearchParams.delete("format");

  const selected = calculatedSearchParams.get("selected");
  if (selected) newUrlSearchParams.set("selected", selected);
  else newUrlSearchParams.delete("selected"); // annoying that setting no value doesn't do this

  const searchParamsString = newUrlSearchParams.toString()
    ? // decode to allow `:` in params; this should be ok https://stackoverflow.com/a/5330261/8409296
      `?${decodeURIComponent(newUrlSearchParams.toString())}`
    : "";

  return searchParamsString;
};

const useUpdateSearchParamsFromStore = (topicDiagramInitiallyLoaded: boolean) => {
  const calculatedSearchParams = useCalculatedSearchParams();
  const [oldCalculatedParams, setOldCalculatedParams] = useState(calculatedSearchParams);

  // useEffect so that Router exists; maybe also necessary to setOldCalculatedParams without optimizing and skipping over the rest
  useEffect(() => {
    const calculatedParamsChanged =
      calculatedSearchParams.toString() !== oldCalculatedParams.toString();
    if (!calculatedParamsChanged) return; // other things could trigger this hook, but we don't care about those

    setOldCalculatedParams(calculatedSearchParams);

    const [pathWithoutSearchParams, urlSearchParamsString] = Router.asPath.split("?");
    const urlSearchParams = new URLSearchParams(urlSearchParamsString);
    const storeMatchesURL = urlSearchParams.toString() == calculatedSearchParams.toString();

    if (storeMatchesURL || !topicDiagramInitiallyLoaded) return;

    const searchParamsString = getNewSearchParamsString(calculatedSearchParams, urlSearchParams);
    const newPath = pathWithoutSearchParams + searchParamsString;

    void Router.push(newPath, undefined);
  }, [calculatedSearchParams, oldCalculatedParams, topicDiagramInitiallyLoaded]);
};

/**
 * Update the store when URL search params change, and vice versa.
 *
 * Infinite loops should be prevented because both sides return if store params == URL params.
 *
 * @param topicDiagramInitiallyLoaded we want to be able to use a substring for graph part ids, which
 * means we need to be able to search the topic store for graph part ids, which meanas we need to
 * start syncing after the topic store is loaded.
 */
export const useSyncSearchParamsWithStore = (topicDiagramInitiallyLoaded: boolean) => {
  useUpdateStoreFromSearchParams(topicDiagramInitiallyLoaded);
  useUpdateSearchParamsFromStore(topicDiagramInitiallyLoaded);
};
